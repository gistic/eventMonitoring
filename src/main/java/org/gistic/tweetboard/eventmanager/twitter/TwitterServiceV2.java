package org.gistic.tweetboard.eventmanager.twitter;

import com.google.common.eventbus.AsyncEventBus;
import org.gistic.tweetboard.TwitterConfiguration;
import twitter4j.FilterQuery;
import twitter4j.TwitterStream;
import twitter4j.TwitterStreamFactory;
import twitter4j.auth.AccessToken;

/**
 * Created by osama-hussain on 5/31/15.
 */
public class TwitterServiceV2 {
    private final AsyncEventBus bus;
    private final String uuid;
    private final String[] hashTags;
    TwitterService twitterService;
    String accessToken;
    String accessTokenSecret;
    TwitterConfiguration twitterConfiguration;
    TwitterStreamFactory twitterStreamFactory;
    TwitterStream twitterStream;
    private TweetListener tweetListener;

    public TwitterServiceV2(TwitterConfiguration twitterConfiguration, TwitterStreamFactory streamFactory, AsyncEventBus bus, String uuid, String[] hashTags, String accessToken, String accessTokenSecret) {
        this.twitterConfiguration = twitterConfiguration;
        this.twitterStreamFactory = streamFactory;
        this.bus = bus;
        this.uuid = uuid;
        this.hashTags = hashTags;
        this.accessToken = accessToken;
        this.accessTokenSecret = accessTokenSecret;
        this.twitterService = new TwitterService(twitterConfiguration, twitterStreamFactory);
    }

    public void start() {
        twitterStream = twitterStreamFactory.getInstance();
        twitterStream.setOAuthConsumer(twitterConfiguration.getConsumerKey(), twitterConfiguration.getConsumerSecret());
        twitterStream.setOAuthAccessToken(new AccessToken(twitterConfiguration.getUserKey(), twitterConfiguration.getUserSecret()));
        this.tweetListener = new TweetListener(bus, hashTags);
        //eventDetailsMap.put(uuid, new EventServiceDetails(tweetListener, bus, hashTags));
//        FilterQuery fq = new FilterQuery();
//        fq.track(hashTags);
        twitterStream.addListener(tweetListener);
        twitterStream.user(hashTags);
    }

    public void stop() {
        twitterStream.removeListener(tweetListener);
        twitterStream.shutdown();
    }
}
