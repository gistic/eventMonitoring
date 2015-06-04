package org.gistic.tweetboard.eventmanager.twitter;

import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import org.gistic.tweetboard.datalogic.TweetDataLogic;
import org.gistic.tweetboard.eventmanager.Event;
import twitter4j.*;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

import java.util.Collections;
import java.util.List;

/**
 * Created by osama-hussain on 6/3/15.
 */
public class WarmupRunnable implements Runnable {
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

        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setDebugEnabled(true);
        builder.setOAuthConsumerKey("6PPRgLzPOf6Mvcj3NkPIlq07Y");
        builder.setOAuthConsumerSecret("Xl3TKJwNQtZmbYGhLcXzUseO9CrdoMav54qODCr2CnFiSIIZpb");
        builder.setOAuthAccessToken(authToken);
        builder.setOAuthAccessTokenSecret(accessTokenSecret);
        builder.setJSONStoreEnabled(true);
        Configuration configuration = builder.build();

        String queryString = "#" + (hashTags[0].replace("#", ""));
        query = new Query(queryString);
        query.setCount(25);

        TwitterFactory factory = new TwitterFactory(configuration);
        this.twitter = factory.getInstance();
        boolean firstTime = true;
        QueryResult queryResult = null;
        try {
            queryResult = twitter.search(query);
            int resultCount = queryResult.getCount();
            System.out.println("result count is: "+resultCount);
            sinceId = queryResult.getSinceId();
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
        } catch (TwitterException e) {
            e.printStackTrace();
            reachedEnd = true;
        }


        int index = 0;
        query.count(100);
        while (!reachedEnd && index<5) {
            query.sinceId(sinceId);
            try {
                queryResult = twitter.search(query);
                int resultCount = queryResult.getCount();
                if (resultCount<100) reachedEnd = true;
                System.out.println("result count is: "+resultCount);
                tweets = queryResult.getTweets();
                tweetDataLogic.warmupStats(tweets);
                index++;
            } catch (TwitterException e) {
                e.printStackTrace();
                break;
            }
        }
    }

    @Override
    public void run() {
//        try {
//            Thread.sleep(3000);
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }
//        boolean firstTime = true;
//        QueryResult queryResult = null;
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
//        int index = 0;
//        query.count(100);
//        while (event.isRunning() && !reachedEnd && index<5) {
//            query.sinceId(sinceId);
//            try {
//                queryResult = twitter.search(query);
//                int resultCount = queryResult.getCount();
//                if (resultCount<100) reachedEnd = true;
//                System.out.println("result count is: "+resultCount);
//                tweets = queryResult.getTweets();
//                tweetDataLogic.warmupStats(tweets);
//                index++;
//            } catch (TwitterException e) {
//                e.printStackTrace();
//                break;
//            }
//        }
    }
}
