package org.gistic.tweetboard.eventmanager.twitter;

import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import org.gistic.tweetboard.datalogic.TweetDataLogic;
import org.gistic.tweetboard.eventmanager.Event;
import org.slf4j.*;
import org.slf4j.LoggerFactory;
import twitter4j.*;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

import java.util.Collections;
import java.util.List;

/**
 * Created by osama-hussain on 6/3/15.
 */
public class WarmupRunnable implements Runnable {
    private static final int MAX_NUMBER_OF_TWEETS_TO_GET_IN_THOUSANDS = 5;
    private final Event event;
    private final TweetDataLogic tweetDataLogic;
    private final String[] hashTags;
    private final String authToken;
    private final String accessTokenSecret;
    private final Twitter twitter;
    private long sinceId;
    private List<Status> tweets;
    private boolean reachedEnd = false;
    private Query query;

    public WarmupRunnable(Event event, TweetDataLogic tweetDataLogic, String[] hashTags, String authToken) {
        this.event = event;
        this.tweetDataLogic = tweetDataLogic;
        this.hashTags = hashTags;
        this.authToken = authToken;
        AuthDao authDao= new AuthDaoImpl();
        this.accessTokenSecret = authDao.getAccessTokenSecret(authToken);

        TwitterConfiguration config = ConfigurationSingleton.getInstance().getTwitterConfiguration();

        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setDebugEnabled(true);
        builder.setOAuthConsumerKey(config.getConsumerKey());
        builder.setOAuthConsumerSecret(config.getConsumerSecret());
        builder.setOAuthAccessToken(authToken);
        builder.setOAuthAccessTokenSecret(accessTokenSecret);
        builder.setJSONStoreEnabled(true);
        Configuration configuration = builder.build();

        String queryString = String.join(",", hashTags);//"#" + (hashTags[0].replace("#", ""));
//         LoggerFactory.getLogger(this.getClass()).info("searching for : " + queryString);
        query = new Query(queryString);
        query.setCount(25);
        query.setResultType(Query.ResultType.recent);

        TwitterFactory factory = new TwitterFactory(configuration);
        this.twitter = factory.getInstance();
        boolean firstTime = true;
        QueryResult queryResult = null;
        try {
            queryResult = twitter.search(query);
            int resultCount = queryResult.getCount();
            System.out.println("result count is: "+resultCount);
            sinceId = queryResult.getSinceId();
            //sinceId =  newId > sinceId ? newId : sinceId;
            if (resultCount < 25) reachedEnd = true;
            List<Status> tweets = queryResult.getTweets();
            Collections.reverse(tweets);
            for (Status tweet : tweets){
                event.postTweetToEvent(new InternalStatus(tweet, TwitterObjectFactory.getRawJSON(tweet)));
//                try {
//                    Thread.sleep(1000);
//                } catch (InterruptedException e) {
//                    e.printStackTrace();
//                }
            }
            query.setMaxId(sinceId);
        } catch (TwitterException e) {
            e.printStackTrace();
            reachedEnd = true;
        }



    }

    @Override
    public void run() {
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
//        boolean firstTime = true;
        QueryResult queryResult = null;
//        try {
//            queryResult = twitter.search(query);
//            int resultCount = queryResult.getCount();
//            System.out.println("result count is: "+resultCount);
//            sinceId = queryResult.getSinceId();
//            if (resultCount < 25) reachedEnd = true;
//            List<Status> tweets = queryResult.getTweets();
//            Collections.reverse(tweets);
//            for (Status tweet : tweets){
//                event.postTweetToEvent(new InternalStatus(tweet, TwitterObjectFactory.getRawJSON(tweet)));
////                try {
////                    Thread.sleep(1000);
////                } catch (InterruptedException e) {
////                    e.printStackTrace();
////                }
//            }
//        } catch (TwitterException e) {
//            e.printStackTrace();
//            reachedEnd = true;
//        }
//
//

        int index = 0;
        query.count(100);
        while (!reachedEnd && index< 10 * MAX_NUMBER_OF_TWEETS_TO_GET_IN_THOUSANDS) {
            query.setMaxId(sinceId);
            try {
                queryResult = twitter.search(query);
            } catch (TwitterException e) {
                LoggerFactory.getLogger(this.getClass()).info("Reached warmup api calls limit!");
                break;
            }
            sinceId = queryResult.getSinceId();
            int resultCount = queryResult.getCount();
            if (resultCount<100) reachedEnd = true;
            System.out.println("result count is: "+resultCount);
            tweets = queryResult.getTweets();
            tweetDataLogic.warmupStats(tweets, event);
            index++;

        }
    }
}
