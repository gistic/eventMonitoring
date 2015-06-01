package org.gistic.tweetboard.eventmanager.twitter;

import com.google.common.eventbus.AsyncEventBus;
import org.gistic.tweetboard.TwitterConfiguration;
import twitter4j.TwitterStreamFactory;
import twitter4j.conf.ConfigurationBuilder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by osama-hussain on 5/31/15.
 */
public class TwitterServiceManagerV2 {
    private final TwitterStreamFactory streamFactory;
    private Map<String, TwitterServiceV2> twitterServices;
    private TwitterConfiguration twitterConfiguration;

    public TwitterServiceManagerV2(TwitterConfiguration twitterConfiguration) {
        this.twitterConfiguration = twitterConfiguration;
        this.streamFactory = new TwitterStreamFactory(new ConfigurationBuilder().setJSONStoreEnabled(true).build());
        this.twitterServices = new HashMap<String, TwitterServiceV2>();
    }

    public void make(AsyncEventBus bus, String[] hashTags, String uuid, String accessToken, String accessTokenSecret) {
        TwitterServiceV2 twitterServiceV2 =
                new TwitterServiceV2(twitterConfiguration, streamFactory, bus, uuid, hashTags, accessToken, accessTokenSecret);
        twitterServices.put(accessToken, twitterServiceV2);
        twitterServiceV2.start();
    }

    public void stop(String accesstoken) {
        twitterServices.get(accesstoken).stop();
    }
}
