package org.gistic.tweetboard.dao;

import org.gistic.tweetboard.representations.EventConfig;
import org.joda.time.DateTime;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.Tuple;
import twitter4j.Status;
import twitter4j.TwitterException;

import java.util.List;
import java.util.Set;

/**
 * Created by sohussain on 4/12/15.
 */
public interface TweetDao {
//    @SqlUpdate("INSERT INTO tweets (created, status) VALUES (:created, :status)")
//    void insert(@Bind("created") DateTime created, @Bind("status") String status);
//    void insert(DateTime created, String status);
////    @SqlQuery("SELECT status FROM tweets ORDER BY created DESC LIMIT 10")
////    List<String> findRecentTweets();
//    List<String> findRecentTweets();
    //void insetIn
    void addNewEventToList(String uuid);

    void setDefaultEventProperties(String uuid);

    void addToArrived(String uuid, Status tweet, String statusString);

    void addNewTweetString(String uuid, Status tweet, String statusString, boolean newArrival);

    void removeFromArrived(String uuid, String id);

    void addToSentForApproval(String uuid, String id);

    Status getOldestTweetNotSentForApproval(String uuid) throws TwitterException;

    void addToApproved(String uuid, String tweetId, boolean starred);

    void removeFromSentForApproval(String uuid, String tweetId);

    void addToUserTweetsSet(String uuid, Status tweet);

    Set<Tuple> getTopNUsers(String uuid, int topN);

    String getGetUserId(String screenName);

    String removeFromApproved(String uuid);

    void addToApprovedSentToClient(String uuid, String tweetId);

    Status getStatus(String tweetId) throws TwitterException;

    void blockAllExistingTweetsByUser(String uuid, String screenName);

    void destroyEvent(String uuid);

    String getStatusString(String tweetId);

    void updateEventConfig(String uuid, EventConfig eventConfig);

    EventConfig getEventConfig(String uuid);

    void approveAllExistingTweetsByUser(String uuid, String screenName);
}