package org.gistic.tweetboard.datalogic;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.ArrayUtils;
import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import org.gistic.tweetboard.dao.TweetDao;
import org.gistic.tweetboard.eventmanager.ExecutorSingleton;
import org.gistic.tweetboard.eventmanager.Message;
import org.gistic.tweetboard.eventmanager.twitter.InternalStatus;
import org.gistic.tweetboard.eventmanager.twitter.SendApprovedTweets;
import org.gistic.tweetboard.representations.*;
import org.slf4j.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Tuple;
import twitter4j.*;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;
import twitter4j.json.DataObjectFactory;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import java.util.*;
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
        Client client = ClientBuilder.newClient();
        WebTarget target = client.target("http://127.0.0.1:8080/api/liveTweets");
        Message msg = new Message(uuid, Message.Type.LiveTweet, statusString);
        target.request().post(Entity.entity(msg, MediaType.APPLICATION_JSON), Message.class);
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
        tweetDao.addNewEventToList(uuid);
        tweetDao.setDefaultEventProperties(uuid, hashTags);
    }

    public InternalStatus getOldestTweetNotSentForApproval() {
        try {
            Status status = tweetDao.getOldestTweetNotSentForApproval(uuid);
            if (status == null) return null;
            String statusId = String.valueOf(status.getId());
            tweetDao.addToSentForApproval(uuid, statusId);
            return new InternalStatus(status, tweetDao.getStatusString(uuid, statusId));
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

    public void deleteEvent() {
        //TODO : test
        tweetDao.destroyEvent(uuid);
    }

    public void updateEventConfig(EventConfig eventConfig) {
        tweetDao.updateEventConfig(uuid, eventConfig);
        Client client = ClientBuilder.newClient();
        WebTarget target = client.target("http://127.0.0.1:8080/api/liveTweets");
        String configString = "";
        try {
            configString = new ObjectMapper().writeValueAsString(eventConfig);
        } catch (JsonProcessingException e) {
            LoggerFactory.getLogger(this.getClass()).error("Error converting pojo, SHOULD NEVER HAPPEN");
        }
        Message msg = new Message(uuid, Message.Type.UiUpdate, configString);
        target.request().post(Entity.entity(msg, MediaType.APPLICATION_JSON), Message.class);
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
                .map(user -> new TopUser(tweetDao.getGetUserId(user.getElement()), user.getElement(), user.getScore(),
                        tweetDao.getProfileImageUrl(user.getElement())))
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
        tweetDao.incrCountryCounter(uuid, countryCode);
    }

    public GenericArray<TopCountry> getTopNCountries(Integer count) {
        Set<Tuple> topCountriesTuple = tweetDao.getTopNCountries(uuid, count);
        TopCountry[] topNcountriesArray = topCountriesTuple.stream()
                .map(country -> new TopCountry(country.getElement(), new Double(country.getScore()).intValue()))
                .collect(Collectors.toList()).toArray(new TopCountry[]{});

        return new GenericArray<TopCountry>(topNcountriesArray);
    }

    public void incrMediaCounter(MediaEntity mediaEntity) {
        tweetDao.incrMedia(uuid);
    }

    public void incrTweetScoreAndSetCreatedTime(long retweetedStatusId, long retweetCreatedAt) {
        tweetDao.setTweetMetaDate(uuid, retweetedStatusId, retweetCreatedAt);
        tweetDao.incrTweetRetweets(uuid, retweetedStatusId);
    }

    public GenericArray<String> getTopNTweets(Integer count, String accessToken) {
        String flag = tweetDao.getTopTweetsGeneratedFlag(uuid);
        if (flag==null){
            tweetDao.deleteTopTweetsSortedSet(uuid);
            tweetDao.setTopTweetsGeneratedFlag(uuid);
            Set<String> tweetKeys = tweetDao.getKeysWithPattern(uuid + ":tweetMeta:*");
            for (String key:tweetKeys){
                TweetMeta tweetMeta = tweetDao.getTweetMeta(key);
                long ageInSeconds = (System.currentTimeMillis()-tweetMeta.getCreationDate())/1000;
                long retweetsCount = tweetMeta.getRetweetsCount();
                double order = Math.log10((retweetsCount > 1) ? retweetsCount : 1);
                double score = Math.round(((order + ageInSeconds / 45000) * 10000000.0)) / 10000000.0;
                String tweetId = key.substring(key.lastIndexOf(':')+1);
                tweetDao.setTweetScore(uuid, tweetId, score);
            }
        }
        //int n = 5;
        Set<Tuple> topTweetsTuple = tweetDao.getTopNTweets(uuid, count);
        if (topTweetsTuple == null) return new GenericArray<String>(new String[]{});
        Long[] topTweetIds = topTweetsTuple.stream()
                .map(tweet -> Long.parseLong(tweet.getElement()) ).collect(Collectors.toList()).toArray(new Long[]{});



        AuthDao authDao = new AuthDaoImpl();
        String accessTokenSecret = authDao.getAccessTokenSecret(accessToken);
        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setJSONStoreEnabled(true);
        builder.setOAuthConsumerKey("6PPRgLzPOf6Mvcj3NkPIlq07Y");
        builder.setOAuthConsumerSecret("Xl3TKJwNQtZmbYGhLcXzUseO9CrdoMav54qODCr2CnFiSIIZpb");
        builder.setOAuthAccessToken(accessToken);
        builder.setOAuthAccessTokenSecret(accessTokenSecret);
        Configuration configuration = builder.build();

        TwitterFactory factory = new TwitterFactory(configuration);
        Twitter twitter = factory.getInstance();
        try {
            ResponseList<Status> statuses = twitter.lookup(ArrayUtils.toPrimitive(topTweetIds));
            List<String> statusesList = new ArrayList<>();
            for (Status status:statuses) {
                statusesList.add(TwitterObjectFactory.getRawJSON(status));
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

    public void warmupStats(List<Status> tweets) {
        for (Status tweet : tweets) {
            for (MediaEntity mediaEntity : tweet.getMediaEntities()) {
                //System.out.println(mediaEntity.getType() + ": " + mediaEntity.getMediaURL());
                incrMediaCounter(mediaEntity);
            }
            boolean isRetweet = tweet.isRetweet();
            if(isRetweet || tweet.getText().contains("RT")) {
                incrTotalRetweets();
                if (isRetweet) {
                    long retweetedStatusId = tweet.getRetweetedStatus().getId();
                    long retweetCreatedAt = tweet.getRetweetedStatus().getCreatedAt().getTime();
                    incrTweetScoreAndSetCreatedTime(retweetedStatusId, retweetCreatedAt);
                }
            } else {
                incrOriginalTweets();
            }
            Place place = tweet.getPlace();
            if (place != null) {
                incrCountryCounter(place.getCountryCode());
            } else {
                //count tweets without country specified?
            }
            //tweetsOverTimeAnalyzer.TweetArrived(status); //TODO resolve hard to find reference issue
            this.setNewTweetMeta(tweet);
            tweetDao.setTweetMetaDate(uuid, tweet.getId(), tweet.getCreatedAt().getTime());
        }
    }

    private void setNewTweetMeta(Status tweet) {
        this.tweetDao.setNewTweetMeta(uuid, tweet);
    }

    public GenericArray<Status> getCachedTweets() {
        List<String> tweetIds = tweetDao.getIdsFromTweetCache(uuid);
        List<Status> cachedStatuses = new ArrayList<>();
        for (String tweetId : tweetIds) {
            String tweetString = tweetDao.getTweetStringsCache(uuid, tweetId);
            try {
                Status status = TwitterObjectFactory.createStatus(tweetString);
                cachedStatuses.add(status);
            } catch (TwitterException | NullPointerException e) {
                logger.error("Failed to make status from string from tweets cache. String was: "+tweetString);
                e.printStackTrace();
            }
        }
        return new GenericArray<Status>(cachedStatuses.toArray(new Status[]{}));
    }
}
