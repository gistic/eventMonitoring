package org.gistic.tweetboard.datalogic;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.apache.commons.lang3.ArrayUtils;
import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import org.gistic.tweetboard.dao.TweetDao;
import org.gistic.tweetboard.eventmanager.*;
import org.gistic.tweetboard.eventmanager.Event;
import org.gistic.tweetboard.eventmanager.twitter.InternalStatus;
import org.gistic.tweetboard.eventmanager.twitter.SendApprovedTweets;
import org.gistic.tweetboard.representations.*;
import org.gistic.tweetboard.resources.LiveTweetsBroadcasterSingleton;
import org.gistic.tweetboard.resources.TwitterUserResource;
import org.gistic.tweetboard.security.*;
import org.gistic.tweetboard.util.Misc;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Tuple;
import twitter4j.*;
import twitter4j.JSONException;
import twitter4j.JSONObject;
import twitter4j.User;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Created by sohussain on 4/12/15.
 */
public class TweetDataLogic {
    private final Logger logger;
    private TweetDao tweetDao;
    String uuid;

    public TweetDataLogic(TweetDao tweetDao, String uuid) {
        this.tweetDao = tweetDao;
        this.uuid = uuid;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    public void addToApproved(InternalStatus status, boolean newArrival) {
        Status tweet = status.getInternalStatus();
        //User u = tweet.getUser();
        String tweetString = status.getStatusString();
        tweetDao.addNewTweetString(uuid, tweet, tweetString, newArrival);
        addToApproved(tweet);
    }

    public void setNewTweetMeta(InternalStatus status) {
        tweetDao.setNewTweetMeta(uuid, status);
    }

    public void addToApproved(Status tweet) {
        String tweetId = String.valueOf(tweet.getId());
        addToApproved(tweetId, false);
    }

    public void addToApproved(String tweetId, boolean starred) {
        tweetDao.removeFromSentForApproval(uuid, tweetId);
        tweetDao.addToApproved(uuid, tweetId, starred);
        String statusString = tweetDao.getStatusString(uuid, tweetId);
        tweetDao.deleteTweetJson(uuid, tweetId);
//        Client client = ClientBuilder.newClient();
//        WebTarget target = client.target("http://127.0.0.1:8080/api/liveTweets");
        Message msg = new Message(uuid, Message.Type.LiveTweet, statusString);
        LiveTweetsBroadcasterSingleton.broadcast(msg);
        //target.request().post(Entity.entity(msg, MediaType.APPLICATION_JSON), Message.class);
    }

    public void addToBlocked(String tweetId) {
        tweetDao.removeFromSentForApproval(uuid, tweetId);
    }

    public InternalStatus addToApprovedSentToClient() throws TwitterException {
        String tweetId = tweetDao.removeFromApproved(uuid);
        LoggerFactory.getLogger(this.getClass()).debug("");
        if (tweetId == null || tweetId.isEmpty()) return null;
        tweetDao.addToApprovedSentToClient(uuid, tweetId);
        Status status = tweetDao.getStatus(uuid, tweetId);
        String statusString = tweetDao.getStatusString(uuid, tweetId);
        return new InternalStatus(status, statusString);
    }

    public void createNewEvent(String[] hashTags) {
        createNewEvent(hashTags, null);
    }

    public InternalStatusJson getOldestTweetNotSentForApproval() {
        try {
            org.json.JSONObject status = tweetDao.getOldestTweetNotSentForApproval(uuid);
            if (status == null) return null;
            String statusId = String.valueOf(status.getLong("id"));
            tweetDao.addToSentForApproval(uuid, statusId);
            return new InternalStatusJson(status, tweetDao.getStatusString(uuid, statusId));
        } catch (TwitterException e) {
            LoggerFactory.getLogger(this.getClass()).error("error in parsing tweet string to status object");
            return null;
        }
    }

    public InternalStatus getOldestTweetApprovedNotSentToClient() {
        try {
            return addToApprovedSentToClient();
        } catch (TwitterException e) {
            return null;
        }
    }

    public void deleteEvent(String authToken) {
        //TODO : test
        //get event details
        ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
        String topUsers = null;
        String topCountries = null;
        String topHashtags = null;
        String topLanguages = null;
        String topTweets = null;
        try {
            topUsers = ow.writeValueAsString(getTopTenNUsers(10));
            topCountries = ow.writeValueAsString(getTopNCountries(10));
            topHashtags = ow.writeValueAsString(getTopNHashtags(10));
            topLanguages = ow.writeValueAsString(getTopNLanguages(10));
            topTweets = ow.writeValueAsString(getTopNTweets(10, authToken));

        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        BasicStats basicStats = tweetDao.getBasicStats(uuid);
        EventMeta eventMeta = tweetDao.getEventMeta(uuid);
        //delete running event details
        tweetDao.destroyEvent(uuid);
        //store event details in history
        saveEventDetailsInHistory(authToken, basicStats, eventMeta, topUsers, topCountries, topHashtags, topLanguages, topTweets);
    }

    public void saveEventDetailsInHistory(String authToken, BasicStats basicStats, EventMeta eventMeta, String topUsers, String topCountries, String topHashtags, String topLanguages, String topTweets) {
        if (authToken != null && !authToken.isEmpty() && !authToken.equalsIgnoreCase("undefined")) {
            saveEventDetailsInUserHistory(authToken, basicStats, eventMeta, topUsers, topCountries, topHashtags, topLanguages, topTweets);
        }
    }

    private void saveEventDetailsInUserHistory(String authToken, BasicStats basicStats, EventMeta eventMeta, String topUsers, String topCountries, String topHashtags, String topLanguages, String topTweets) {
        AuthDao authDao = new AuthDaoImpl();
        org.gistic.tweetboard.security.User user = new org.gistic.tweetboard.security.User(authToken, authDao.getAccessTokenSecret(authToken));
        String userJsonString = new TwitterUserResource().getLoggedInUser(user);
        org.json.JSONObject userJson = new org.json.JSONObject(userJsonString);
        String screenName = userJson.getString("screenName");
        String profileImgUrl = userJson.getString("profileImageURL");
        String hashtags = eventMeta.getHashtags();
        String startTime = eventMeta.getStartTime();
        String mediaUrl = eventMeta.getMediaUrl();
        long noOfTweets = basicStats.getTotalTweets();
        long noOfRetweets = basicStats.getTotalRetweets();
        tweetDao.storeEventInUserHistory(hashtags, startTime, screenName, profileImgUrl, noOfTweets, noOfRetweets, eventMeta.getUuid(), authToken, mediaUrl);
    }

    public void updateEventConfig(EventConfig eventConfig) {
        tweetDao.updateEventConfig(uuid, eventConfig);
//        Client client = ClientBuilder.newClient();
//        WebTarget target = client.target("http://127.0.0.1:8080/api/liveTweets");
        String configString = "";
        try {
            configString = new ObjectMapper().writeValueAsString(eventConfig);
        } catch (JsonProcessingException e) {
            LoggerFactory.getLogger(this.getClass()).error("Error converting pojo, SHOULD NEVER HAPPEN");
        }
        Message msg = new Message(uuid, Message.Type.UiUpdate, configString);
        LiveTweetsBroadcasterSingleton.broadcast(msg);
//        target.request().post(Entity.entity(msg, MediaType.APPLICATION_JSON), Message.class);
    }

    public EventConfig getEventConfig(String uuid) {
        return tweetDao.getEventConfig(uuid);
    }

    public void approveAllExistingTweetsByUser(String screenName) {
        tweetDao.approveAllExistingTweetsByUser(uuid, screenName);
    }
    public void blockAllExistingTweetsByUser(String screenName) {
        tweetDao.blockAllExistingTweetsByUser(uuid, screenName);
    }

    public List<TopUser> getTopTenNUsers(Integer count) {
        Set<Tuple> topUsers = tweetDao.getTopNUsers(uuid, count);

        return topUsers.stream()
                .map(user -> new TopUser(tweetDao.getGetUserId(user.getElement(), uuid), user.getElement(), user.getScore(),
                        tweetDao.getProfileImageUrl(uuid, user.getElement())))
                .collect(Collectors.toList());
    }

    public BasicStats getBasicStats(String uuid) {
        return tweetDao.getBasicStats(uuid);
    }

    public void incrTotalRetweets() {
        tweetDao.incrRetweets(uuid);
    }

    public void incrOriginalTweets() {
        tweetDao.incrTweets(uuid);
    }

    public void approveAllTweets() {
        List<String> tweetIdsList = tweetDao.getAllTweetIdsSentForApprovalAndDeleteFromSentForApproval(uuid);
        Collections.reverse(tweetIdsList);
        String[] tweetIds = tweetIdsList.toArray(new String[]{});
        tweetDao.addToApprovedSentToClient(uuid, tweetIds);
        ExecutorSingleton.getInstance().execute(new SendApprovedTweets(tweetIds, tweetDao, uuid));
    }

    public void incrCountryCounter(String countryCode) {
        double count = tweetDao.incrCountryCounter(uuid, countryCode);
//        Client client = ClientBuilder.newClient();
//        WebTarget target = client.target("http://127.0.0.1:8080/api/liveTweets");
        //Message msg = new Message(uuid, Message.Type.LiveTweet, statusString);
        Message msg = new Message(uuid, Message.Type.CountryUpdate, createCountryUpdateMessage(countryCode, count));
        LiveTweetsBroadcasterSingleton.broadcast(msg);
        //target.request().post(Entity.entity(msg, MediaType.APPLICATION_JSON), Message.class);
    }

    private String createCountryUpdateMessage(String countryCode, double count) {
        try {
            return new JSONObject().put("code", countryCode).put("count", new Double(count).intValue()).toString();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return "ERROR";
    }

    public GenericArray<TopItem> getTopNCountries(Integer count) {
        Set<Tuple> topCountriesTuple = tweetDao.getTopNCountries(uuid, count);
        TopItem[] topNCountriesArray = topCountriesTuple.stream()
                .map(language -> new TopItem(language.getElement(), new Double(language.getScore()).intValue()))
                .collect(Collectors.toList()).toArray(new TopItem[]{});

        return new GenericArray<TopItem>(topNCountriesArray);
    }

    public GenericArray<TopItem> getTopNLanguages(Integer count) {
        Set<Tuple> topLanguagesTuple = tweetDao.getTopNLanguages(uuid, count);
        TopItem[] topNLanguagesArray = topLanguagesTuple.stream()
                .map(language -> new TopItem(language.getElement(), new Double(language.getScore()).intValue()))
                .collect(Collectors.toList()).toArray(new TopItem[]{});
        return new GenericArray<TopItem>(topNLanguagesArray);
    }

    public GenericArray<TopItem> getTopNSources(Integer count) {
        Set<Tuple> topSourcesTuple = tweetDao.getTopNSources(uuid, count);
        TopItem[] topNSourcesArray = topSourcesTuple.stream()
                .map(source -> new TopItem(source.getElement(), new Double(source.getScore()).intValue()))
                .collect(Collectors.toList()).toArray(new TopItem[]{});
        return new GenericArray<TopItem>(topNSourcesArray);
    }

    public GenericArray<TopItem> getTopNHashtags(Integer count) {
        Set<Tuple> topHashtagsTuple = tweetDao.getTopNHashtags(uuid, count);
        TopItem[] topNHashtagsArray = topHashtagsTuple.stream()
                .map(hashtag -> new TopItem(hashtag.getElement(), new Double(hashtag.getScore()).intValue()))
                .collect(Collectors.toList()).toArray(new TopItem[]{});
        return new GenericArray<TopItem>(topNHashtagsArray);
    }

    public GenericArray<TopItem> getTopNWords(Integer count) {
        Set<Tuple> topWordsTuple = tweetDao.getTopNWords(uuid, count);
        TopItem[] topNWordsArray = topWordsTuple.stream()
                .map(word -> new TopItem(word.getElement(), new Double(word.getScore()).intValue()))
                .collect(Collectors.toList()).toArray(new TopItem[]{});
        return new GenericArray<TopItem>(topNWordsArray);
    }

    public void incrMediaCounter(MediaEntity mediaEntity) {
        tweetDao.incrMedia(uuid);
    }

    public void incrTweetScore(long retweetedStatusId, long retweetCreatedAt) {
        tweetDao.incrTweetRetweets(uuid, retweetedStatusId);
    }

    public void setCreatedDate(long statusId, long createdAt) {
        tweetDao.setTweetMetaDate(uuid, statusId, createdAt);
    }

    public GenericArray<String> getTopNTweets(Integer count, String accessToken) {
        String flag = tweetDao.getTopTweetsGeneratedFlag(uuid);
        if (flag==null){
            tweetDao.deleteTopTweetsSortedSet(uuid);
            tweetDao.setTopTweetsGeneratedFlag(uuid);
            Set<String> ids = tweetDao.getAllTweetsIds(uuid);
            for (String id : ids){
                //System.out.println("key is: " + id);
                TweetMeta tweetMeta = tweetDao.getTweetMeta(tweetDao.getTweetMetaKey(uuid, id));
                long ageInSeconds = (System.currentTimeMillis()-tweetMeta.getCreationDate())/1000;
                long retweetsCount = tweetMeta.getRetweetsCount();
                double order = Math.log10((retweetsCount > 1) ? retweetsCount : 1);
                double score = Math.round(((order + ageInSeconds / 45000) * 10000000.0)) / 10000000.0;
                String tweetId = id; //key.substring(key.lastIndexOf(':')+1);
                tweetDao.setTweetScore(uuid, tweetId, score);
            }
        }
        //int n = 5;
        Set<Tuple> topTweetsTuple = tweetDao.getTopNTweets(uuid, count);
        if (topTweetsTuple == null) return new GenericArray<String>(new String[]{});
//        Long[] topTweetIds = topTweetsTuple.stream()
//                .map(tweet -> Long.parseLong(tweet.getElement()) ).collect(Collectors.toList()).toArray(new Long[]{});
        Map<String, Double> topTweetsMap = topTweetsTuple.stream()
                .collect(Collectors.toMap(Tuple::getElement, Tuple::getScore));
        TwitterConfiguration config = ConfigurationSingleton.getInstance().getTwitterConfiguration();

        AuthDao authDao = new AuthDaoImpl();
        String accessTokenSecret = authDao.getAccessTokenSecret(accessToken);
        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setJSONStoreEnabled(true);
        builder.setOAuthConsumerKey(config.getConsumerKey());
        builder.setOAuthConsumerSecret(config.getConsumerSecret());
        builder.setOAuthAccessToken(accessToken);
        builder.setOAuthAccessTokenSecret(accessTokenSecret);
        Configuration configuration = builder.build();

        TwitterFactory factory = new TwitterFactory(configuration);
        Twitter twitter = factory.getInstance();
        try {
            String[] keySet = topTweetsMap.keySet().toArray(new String[topTweetsMap.size()]);
            Long[] idsLongArray = Arrays.stream(keySet).map(Long::parseLong).toArray(Long[]::new);
            long[] idsArray = ArrayUtils.toPrimitive(idsLongArray);
            ResponseList<Status> statuses = twitter.lookup(idsArray);
            List<String> statusesList = new ArrayList<>();
            Set<String> tweetTextSet = new HashSet<>();
            for (Status status:statuses) {
                if (!tweetTextSet.add(status.getText())) continue;
                String statusString = TwitterObjectFactory.getRawJSON(status).replace("_normal","");
                long rtCount = tweetDao.getTweetMeta(tweetDao.getTweetMetaKey(uuid, String.valueOf(status.getId()))).getRetweetsCount();
                statusesList.add(Misc.addScoreToStatusString(statusString, rtCount));
            }
            return new GenericArray<String>(statusesList.toArray(new String[]{}));
        } catch (TwitterException e) {
            e.printStackTrace();
        }

        return new GenericArray<String>(new String[]{});
    }

    public void newArrived(InternalStatus tweet) {
        tweetDao.addNewTweetString(uuid, tweet.getInternalStatus(), tweet.getStatusString(), false);
        tweetDao.addToArrived(uuid, tweet.getInternalStatus(), tweet.getStatusString());
        tweetDao.addToUserTweetsSet(uuid, tweet.getInternalStatus());
    }

    public void addToCache(InternalStatus status) {
        tweetDao.addToTweetStringCache(uuid, status);
        long currentCacheSize = tweetDao.addToCache(uuid, status);
        if (currentCacheSize > 25l) {
            String poppedTweetId = tweetDao.popFromCache(uuid);
            tweetDao.removeFromTweetStringCache(uuid, poppedTweetId);
        }
//        tweetDao.addNewTweetString(uuid, tweet.getInternalStatus(), tweet.getStatusString(), false);
//        tweetDao.addToArrived(uuid, tweet.getInternalStatus(), tweet.getStatusString());
//        tweetDao.addToUserTweetsSet(uuid, tweet.getInternalStatus());
    }

    public void warmupStats(List<Status> tweets, Event event) {
        for (Status tweet : tweets) {

            String text = tweet.getText();
            text = text.replaceAll("((https?|ftp|file):\\/\\/[-a-zA-Z0-9+&@#\\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\\/%=~_|])", "");
            Pattern pattern = Pattern.compile("(\\b(?<!#|http)\\w+)");
//         pattern.toString();
            Matcher matcher = pattern.matcher(text);
            while (matcher.find()) {
                String word = matcher.group().toLowerCase();
                if (Misc.isBadWord(word)) return;
                if (Misc.isCommon(word)) return;
                this.incrWordCounter(word);
//            if ( word.startsWith("#") ) {
//                LoggerFactory.getLogger(this.getClass()).debug("got hashtag: "+ word);
//                tweetDataLogic.incrHashtagCounter(language);
//            }
//            else {
//                process it as word in word cloud
//            }
            }

            HashtagEntity[] hashtagEntities = tweet.getHashtagEntities();
            for ( HashtagEntity entity : hashtagEntities ) {
                String hashtag = entity.getText();
                this.incrHashtagCounter(hashtag);
            }

            tweetDao.setTweetMetaDate(uuid, tweet.getId(), tweet.getCreatedAt().getTime());
            for (MediaEntity mediaEntity : tweet.getMediaEntities()) {
                //System.out.println(mediaEntity.getType() + ": " + mediaEntity.getMediaURL());
                incrMediaCounter(mediaEntity);
                this.setMediaUrl(mediaEntity.getMediaURLHttps());
            }
            String language = tweet.getLang();
            if (language!=null || !language.isEmpty()) {
                this.incrLaguageCounter(language);
            }
            boolean isRetweet = tweet.isRetweet();
            if(isRetweet || tweet.getText().contains("RT")) {
                incrTotalRetweets();
                if (isRetweet) {
                    long retweetedStatusId = tweet.getRetweetedStatus().getId();
                    long retweetCreatedAt = tweet.getRetweetedStatus().getCreatedAt().getTime();
                    this.incrTweetScore(retweetedStatusId, retweetCreatedAt);
                }
            } else {
                incrOriginalTweets();
            }
            this.setCreatedDate(tweet.getId(), tweet.getCreatedAt().getTime());
            this.setNewTweetMeta(tweet);
            Place place = tweet.getPlace();
            if (place != null) {
                System.out.println("found place:" + place.getCountryCode());
                incrCountryCounter(place.getCountryCode());
            } else {
                //try and get country from user location
                String countryCode = Misc.checkCountryAndGetCode(tweet.getUser().getLocation());
                if (countryCode != null && !countryCode.isEmpty()) {
                    this.incrCountryCounter(countryCode);
                }
            }
            String originalSource = tweet.getSource();
            if(originalSource.indexOf(">") != -1 && originalSource.lastIndexOf("<") != -1) {
                String source = originalSource.substring(originalSource.indexOf(">") + 1, originalSource.lastIndexOf("<"));
                if (source != null || !source.isEmpty()) {
                    incrSourceCounter(source);
                }
            }
            //tweetsOverTimeAnalyzer.TweetArrived(status);
            //event.updateStats(tweet);

        }
    }

    private void setNewTweetMeta(Status tweet) {
        this.tweetDao.setNewTweetMeta(uuid, tweet);
    }

    public GenericArray<String> getCachedTweets() {
        List<String> tweetIds = tweetDao.getIdsFromTweetCache(uuid);
        List<String> cachedStatuses = new ArrayList<>();
        for (String tweetId : tweetIds) {
            String tweetString = tweetDao.getTweetStringsCache(uuid, tweetId);
            org.json.JSONObject json = new org.json.JSONObject(tweetString);
            long id = json.getLong("id");
            String idAsString = String.valueOf(id);
            json.put("id_str", idAsString);
            tweetString = json.toString();
//            try {
                //Status status = TwitterObjectFactory.createStatus(tweetString);
                cachedStatuses.add(tweetString);
//            } catch (TwitterException | NullPointerException e) {
//                logger.error("Failed to make status from string from tweets cache. String was: "+tweetString);
//                e.printStackTrace();
//            }
        }
        return new GenericArray<String>(cachedStatuses.toArray(new String[]{}));
    }

    public void incrLaguageCounter(String language) {
        tweetDao.incrLanguageCounter(uuid, language);
    }

    public void incrHashtagCounter(String hashtag) {
        tweetDao.incrHashtagCounter(uuid, hashtag);
    }

    public void incrWordCounter(String word) {
        tweetDao.incrWordCounter(uuid, word);
    }

    public void incrSourceCounter(String source) {
        tweetDao.incrSourceCounter(uuid, source);
    }

    public void setMediaUrl(String mediaURLHttps) {
        tweetDao.setMediaUrl(uuid, mediaURLHttps);
    }

    public void addToUserEvents(String uuid, String authCode) {
        org.gistic.tweetboard.security.User user = new org.gistic.tweetboard.security.User(authCode, new AuthDaoImpl().getAccessTokenSecret(authCode));
        try {
            String userProfileStr = new TwitterUserDataLogic().getUserProfile(user);
            JSONObject userJson = new JSONObject(userProfileStr);
            long authCodeLong = userJson.getLong("id");
            authCode = String.valueOf(authCodeLong);
        } catch (TwitterException e) {
            e.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        tweetDao.addToUserEventsList(uuid, authCode);
    }

    public void deleteEventFromUserEvents(String authToken) {
        tweetDao.removeFromUserEventsList(uuid, authToken);
    }

    public void createNewEvent(String[] hashTags, String accessToken) {
        tweetDao.addNewEventToList(uuid);
        tweetDao.setDefaultEventProperties(uuid, hashTags, accessToken);
    }
}
