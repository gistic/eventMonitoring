package org.gistic.tweetboard.datalogic;

import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import org.gistic.tweetboard.dao.TweetDao;
import org.gistic.tweetboard.representations.EventMeta;
import org.gistic.tweetboard.representations.EventMetaList;
import org.gistic.tweetboard.representations.EventsList;
import org.gistic.tweetboard.representations.HistoricUserEvent;
import org.gistic.tweetboard.resources.TwitterUserResource;
import twitter4j.*;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by osama-hussain on 6/21/15.
 */
public class MetaDataLogic {
    private TweetDao dao;

    public MetaDataLogic(TweetDao dao) {
        this.dao = dao;
    }

    public EventMetaList getAllEventsInfo() {
        EventMetaList eventMetaList = dao.getEventMetaList();
        String[] hashtags = updateAndSetTrendingHashtags();
        eventMetaList.setTrendingHashtags(hashtags);
        return eventMetaList;
    }

    private String[] updateAndSetTrendingHashtags() {
        String[] hashtags = dao.getTrendingHashtags();
        if (hashtags == null) {
            TwitterConfiguration config = ConfigurationSingleton.getInstance().getTwitterConfiguration();
            ConfigurationBuilder builder = new ConfigurationBuilder();
            builder.setJSONStoreEnabled(true);
            builder.setOAuthConsumerKey(config.getConsumerKey());
            builder.setOAuthConsumerSecret(config.getConsumerSecret());
            builder.setOAuthAccessToken(config.getUserKey());
            builder.setOAuthAccessTokenSecret(config.getUserSecret());
            Configuration configuration = builder.build();

            TwitterFactory factory = new TwitterFactory(configuration);
            Twitter twitter = factory.getInstance();
            try {
                Trend[] trends = twitter.getPlaceTrends(1).getTrends();
                hashtags = new String[trends.length];
                for (int i = 0 ; i < trends.length ; i++){
                    hashtags[i] = trends[i].getName();
                }
                dao.setTrendindHashtags(hashtags);
            } catch (TwitterException e) {
                e.printStackTrace();
            }
        }
        return hashtags;
    }

    public EventsList getRunningEventsList(String authToken) {
        Set<String> hashtagsSet = new HashSet<>();
        Set<String> runningNonUserHashTags = new HashSet<>();
        Set<String> historicUserHashTags = new HashSet<>();
        EventMetaList allEvents = getAllEventsInfo();
        String[] trendingHashtags = updateAndSetTrendingHashtags();
        EventMeta[] eventMetaList = allEvents.getData();
        List<String> userEventIds = new ArrayList<>();
        List<EventMeta> runningServerEvents = new ArrayList<>();
        List<EventMeta> runningUserEvents = new ArrayList<>();
        List<String> historicUserEventIds = new ArrayList<>();
        List<HistoricUserEvent> historicUserEvents = new ArrayList<>();
        if (authToken != null) {
            org.gistic.tweetboard.security.User user = new org.gistic.tweetboard.security.User(authToken, new AuthDaoImpl().getAccessTokenSecret(authToken));
            try {
                authToken = String.valueOf( new JSONObject( new TwitterUserDataLogic().getUserProfile(user) ).getLong("id") );
            } catch (TwitterException e) {
                e.printStackTrace();
            } catch (JSONException e) {
                e.printStackTrace();
            }
            userEventIds = dao.getUserEventsList(authToken);
            historicUserEventIds = dao.getHistoricUserEventIds(authToken);
        }
        for (EventMeta event : eventMetaList) {
            String uuid = event.getUuid();
            EventMeta eventMeta = dao.getEventMeta(uuid);
            String accessToken = eventMeta.getAccessToken();
            if (!accessToken.isEmpty()) {
                AuthDao authDao = new AuthDaoImpl();
                org.gistic.tweetboard.security.User user = new org.gistic.tweetboard.security.User(accessToken, authDao.getAccessTokenSecret(accessToken));
                String userJsonString = new TwitterUserResource().getLoggedInUser(user);
                org.json.JSONObject userJson = new org.json.JSONObject(userJsonString);
                String screenName = userJson.getString("screenName");
                String profileImgUrl = userJson.getString("profileImageURL");
                eventMeta.setScreenName(screenName);
                eventMeta.setProfileImageUrl(profileImgUrl);
                if (userEventIds.contains(uuid)) {
                    if (!hashtagsSet.contains(eventMeta.getHashtags())) {
                        runningUserEvents.add(eventMeta);
                        hashtagsSet.add(eventMeta.getHashtags());
                    }
                }
            }
        }

        for (EventMeta event : eventMetaList) {
            String uuid = event.getUuid();
            EventMeta eventMeta = dao.getEventMeta(uuid);
            String accessToken = eventMeta.getAccessToken();
            if (!accessToken.isEmpty()) {
                AuthDao authDao = new AuthDaoImpl();
                org.gistic.tweetboard.security.User user = new org.gistic.tweetboard.security.User(accessToken, authDao.getAccessTokenSecret(accessToken));
                String userJsonString = new TwitterUserResource().getLoggedInUser(user);
                org.json.JSONObject userJson = new org.json.JSONObject(userJsonString);
                String screenName = userJson.getString("screenName");
                String profileImgUrl = userJson.getString("profileImageURL");
                eventMeta.setScreenName(screenName);
                eventMeta.setProfileImageUrl(profileImgUrl);
                if (!userEventIds.contains(uuid)) {
                    if (!hashtagsSet.contains(eventMeta.getHashtags())) {
                        eventMeta.setUuid(null);
                        runningServerEvents.add(eventMeta);
                        hashtagsSet.add(eventMeta.getHashtags());
                    }
                }
            }
            if (runningServerEvents.size() > 10) {
                break;
            }
        }

        for (String historicUserEventId : historicUserEventIds) {
            HistoricUserEvent eventMeta = dao.getHistoricUserEvent(historicUserEventId);
            if (eventMeta != null && !hashtagsSet.contains(eventMeta.getHashtags())) {
                historicUserEvents.add(eventMeta);
                hashtagsSet.add(eventMeta.getHashtags());
            }
            if (historicUserEvents.size() > 10) {
                break;
            }
        }
        EventsList eventsList = new EventsList();
        eventsList.setRunningServerEvents(runningServerEvents);
        eventsList.setRunningUserEvents(runningUserEvents);
        eventsList.setTrendingHashtags(trendingHashtags);
        eventsList.setHistoricUserEvents(historicUserEvents);
        return eventsList;
    }

    public void storeEventDetailsInHistory(String uuid, org.gistic.tweetboard.security.User user) {
        // TODO finish implementation
        EventMeta eventMeta = dao.getEventMeta(uuid);
        if (user != null && !user.isNoUser() && user.getAccessToken() != null) {
            List<String> userEventIds = dao.getUserEventsList(user.getAccessToken());
            if (userEventIds.contains(uuid)) {
                //store in user historic events
            }
        } else {
            //store in server historic events
            //dao.addToServerHistoricEvents(eventMeta);
        }

    }
}
