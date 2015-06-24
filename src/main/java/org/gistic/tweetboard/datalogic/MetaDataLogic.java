package org.gistic.tweetboard.datalogic;

import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import org.gistic.tweetboard.dao.TweetDao;
import org.gistic.tweetboard.eventmanager.EventMap;
import org.gistic.tweetboard.representations.EventMeta;
import org.gistic.tweetboard.representations.EventMetaList;
import org.gistic.tweetboard.representations.EventsList;
import org.gistic.tweetboard.representations.HistoricUserEvent;
import org.gistic.tweetboard.resources.TwitterUserResource;
import org.gistic.tweetboard.security.*;
import twitter4j.*;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

import java.util.ArrayList;
import java.util.List;

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
        EventMetaList allEvents = getAllEventsInfo();
        String[] trendingHashtags = updateAndSetTrendingHashtags();
        EventMeta[] eventMetaList = allEvents.getData();
        List<String> userEventIds = new ArrayList<>();
        List<EventMeta> runningServerEvents = new ArrayList<>();
        List<EventMeta> runningUserEvents = new ArrayList<>();
        List<String> historicUserEventIds = new ArrayList<>();
        List<HistoricUserEvent> historicUserEvents = new ArrayList<>();
        if (authToken != null) {
            userEventIds = dao.getUserEventsList(authToken);
            historicUserEventIds = dao.getHistoricUserEventIds(authToken);
        }
        for (EventMeta event : eventMetaList) {
            String uuid = event.getUuid();
            EventMeta eventMeta = dao.getEventMeta(uuid);
            String accessToken = eventMeta.getAccessToken();
            AuthDao authDao = new AuthDaoImpl();
            org.gistic.tweetboard.security.User user = new org.gistic.tweetboard.security.User(authToken, authDao.getAccessTokenSecret(authToken));
            String userJsonString = new TwitterUserResource().getLoggedInUser(user);
            org.json.JSONObject userJson = new org.json.JSONObject(userJsonString);
            String screenName = userJson.getString("screenName");
            String profileImgUrl = userJson.getString("profileImageURL");
            eventMeta.setScreenName(screenName);
            eventMeta.setPrfoileImageUrl(profileImgUrl);
            if (userEventIds.contains(uuid)) {
                runningUserEvents.add(eventMeta);
            } else {
                runningServerEvents.add(eventMeta);
            }
        }
        for (String historicUserEventId : historicUserEventIds) {
            historicUserEvents.add( dao.getHistoricUserEvent(historicUserEventId) );
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
