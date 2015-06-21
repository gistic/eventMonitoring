package org.gistic.tweetboard.datalogic;

import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TweetBoardConfiguration;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.dao.TweetDao;
import org.gistic.tweetboard.representations.EventMetaList;
import twitter4j.*;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

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
        eventMetaList.setTrendingHashtags(hashtags);
        return eventMetaList;
    }
}
