package org.gistic.tweetboard.eventmanager.twitter;

import com.google.common.collect.Lists;
import com.google.common.eventbus.AsyncEventBus;
import com.twitter.hbc.ClientBuilder;
import com.twitter.hbc.core.Constants;
import com.twitter.hbc.core.endpoint.UserstreamEndpoint;
import com.twitter.hbc.core.processor.StringDelimitedProcessor;
import com.twitter.hbc.httpclient.BasicClient;
import com.twitter.hbc.httpclient.auth.Authentication;
import com.twitter.hbc.httpclient.auth.OAuth1;
import org.gistic.tweetboard.TwitterConfiguration;
import twitter4j.FilterQuery;
import twitter4j.TwitterStream;
import twitter4j.TwitterStreamFactory;
import twitter4j.auth.AccessToken;
import com.twitter.hbc.twitter4j.Twitter4jStatusClient;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

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
    private Twitter4jStatusClient t4jClient;

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
//        twitterStream = twitterStreamFactory.getInstance();
//        twitterStream.setOAuthConsumer(twitterConfiguration.getConsumerKey(), twitterConfiguration.getConsumerSecret());
//        twitterStream.setOAuthAccessToken(new AccessToken(twitterConfiguration.getUserKey(), twitterConfiguration.getUserSecret()));
        this.tweetListener = new TweetListener(bus, hashTags);
        Authentication auth = new OAuth1(twitterConfiguration.getConsumerKey(), twitterConfiguration.getConsumerSecret(),
                accessToken, accessTokenSecret);
        UserstreamEndpoint userStream = new UserstreamEndpoint();
        userStream.withUser(false);
        userStream.addQueryParameter("track", String.join(",", hashTags));

        BlockingQueue<String> queue = new LinkedBlockingQueue<String>(10000);
        // Create a new BasicClient. By default gzip is enabled.
        BasicClient client = new ClientBuilder()
                .hosts(Constants.USERSTREAM_HOST)
                .endpoint(userStream)
                .authentication(auth)
                .processor(new StringDelimitedProcessor(queue))
                .build();

        // Create an executor service which will spawn threads to do the actual work of parsing the incoming messages and
        // calling the listeners on each message
        int numProcessingThreads = 4;
        ExecutorService service = Executors.newFixedThreadPool(numProcessingThreads);

        // Wrap our BasicClient with the twitter4j client
        t4jClient = new Twitter4jStatusClient(
                client, queue, Lists.newArrayList(tweetListener), service);

        // Establish a connection
        t4jClient.connect();

        for (int threads = 0; threads < numProcessingThreads; threads++) {
            // This must be called once per processing thread
            t4jClient.process();
        }

        //eventDetailsMap.put(uuid, new EventServiceDetails(tweetListener, bus, hashTags));
//        FilterQuery fq = new FilterQuery();
//        fq.track(hashTags);
//        twitterStream.addListener(tweetListener);
//        twitterStream.user(hashTags);
    }

    public void stop() {
//        twitterStream.removeListener(tweetListener);
//        twitterStream.shutdown();
        t4jClient.stop();
    }
}
