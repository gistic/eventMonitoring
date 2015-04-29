package org.gistic.tweetboard.eventmanager.twitter;

import com.google.common.eventbus.AsyncEventBus;
import org.gistic.tweetboard.TweetBoardConfiguration;
import org.gistic.tweetboard.TwitterConfiguration;
import twitter4j.TwitterStreamFactory;
import twitter4j.conf.ConfigurationBuilder;

/**
 * Created by Osama-GIS on 4/22/2015.
 */
public class TwitterServiceManager {

    static private TwitterStreamFactory streamFactory;
    static private TwitterService twitterService = null;
    public static void make(TwitterConfiguration config, AsyncEventBus bus, String[] hashTags, String uuid) {
        streamFactory = new TwitterStreamFactory(new ConfigurationBuilder().setJSONStoreEnabled(true).build());
        if (twitterService == null) {
            twitterService = new TwitterService(config, streamFactory);
            try { twitterService.start(bus, uuid, hashTags);} catch (Exception e) {e.printStackTrace();}
        }
        twitterService.addNewEvent(bus, uuid, hashTags);
    }

    public static void stop(String uuid) throws Exception {
        //if no more running services (event reader streams from twitter)
        if (twitterService.stop(uuid)) twitterService = null;
    }
}
