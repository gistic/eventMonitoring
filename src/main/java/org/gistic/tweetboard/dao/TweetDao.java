package org.gistic.tweetboard.dao;

import org.gistic.tweetboard.datalogic.TweetMeta;
import org.gistic.tweetboard.eventmanager.twitter.InternalStatus;
import org.gistic.tweetboard.representations.*;
import org.joda.time.DateTime;
import org.json.JSONObject;
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

    void setDefaultEventProperties(String uuid, String[] hashTags, String accessToken);

    void addToArrived(String uuid, Status tweet, String statusString);

    void addNewTweetString(String uuid, Status tweet, String statusString, boolean newArrival);


    void removeFromArrived(String uuid, String id);

    void addToSentForApproval(String uuid, String id);

    JSONObject getOldestTweetNotSentForApproval(String uuid) throws TwitterException;

    void addToApproved(String uuid, String tweetId, boolean starred);

    void removeFromSentForApproval(String uuid, String tweetId);

    void addToUserTweetsSet(String uuid, Status tweet);

    Set<Tuple> getTopNUsers(String uuid, int topN);

    String getGetUserId(String screenName, String uuid);

    String removeFromApproved(String uuid);

    void addToApprovedSentToClient(String uuid, String... tweetIds);

    Status getStatus(String uuid, String tweetId) throws TwitterException;

    Set<Tuple> getTopNLanguages(String uuid, Integer count);

    Set<Tuple> getTopNSources(String uuid, Integer count);

    Set<Tuple> getTopNHashtags(String uuid, Integer count);

    Set<Tuple> getTopNWords(String uuid, Integer count);

    void blockAllExistingTweetsByUser(String uuid, String screenName);

    void destroyEvent(String uuid);

    JSONObject getStatusJson(String uuid, String tweetId) throws TwitterException;

    String getStatusString(String uuid, String tweetId);

    void updateEventConfig(String uuid, EventConfig eventConfig);

    EventConfig getEventConfig(String uuid);

    void approveAllExistingTweetsByUser(String uuid, String screenName);

    String getProfileImageUrl(String uuid, String element);

    EventMetaList getEventMetaList();

    void incrRetweets(String uuid);

    void incrTweets(String uuid);

    BasicStats getBasicStats(String uuid);

    List<String> getAllTweetIdsSentForApprovalAndDeleteFromSentForApproval(String uuid);

    void deleteTweetJson(String uuid, String tweetId);

    void setNewTweetMeta(String uuid, InternalStatus status);

    void setNewTweetMeta(String uuid, Status tweet);

    Double incrCountryCounter(String uuid, String countryCode);

    Set<Tuple> getTopNCountries(String uuid, Integer count);
    void incrMedia(String uuid);

    void setTweetMetaDate(String uuid, long retweetedStatusId, long retweetCreatedAt);

    void incrTweetRetweets(String uuid, long retweetedStatusId);

    void incrTweetRetweetsByN(String uuid, long retweetedStatusId, int n);

    String getTopTweetsGeneratedFlag(String uuid);

    void setTopTweetsGeneratedFlag(String uuid);

    Set<String> getKeysWithPattern(String pattern);

    TweetMeta getTweetMeta(String key);

    void setTweetScore(String uuid, String tweetId, double score);

    void deleteTopTweetsSortedSet(String uuid);

    Set<Tuple> getTopNTweets(String uuid, int n);

    Long addToCache(String uuid, InternalStatus status);

    String popFromCache(String uuid);

    void addToTweetStringCache(String uuid, InternalStatus status);

    void removeFromTweetStringCache(String uuid, String poppedTweetId);

    String getTweetStringsCache(String uuid, String id);

    List<String> getIdsFromTweetCache(String uuid);

    Set<String> getAllTweetsIds(String uuid);

    String getTweetMetaKey(String uuid, String key);

    void incrLanguageCounter(String uuid, String language);

    void incrHashtagCounter(String uuid, String hashtag);

    void incrWordCounter(String uuid, String word);

    void incrSourceCounter(String uuid, String word);

    void setMediaUrl(String uuid, String mediaURLHttps);

    String[] getTrendingHashtags();

    void setTrendindHashtags(String[] hashtags);

    void addToUserEventsList(String uuid, String authCode);

    List<String> getUserEventsList(String authCode);

    void removeFromUserEventsList(String uuid, String authToken);

    EventMeta getEventMeta(String uuid);

    void storeEventInUserHistory(String hashtags, String startTime, String screenName, String profileImgUrl, long noOfTweets, long noOfRetweets, String uuid, String authToken, String mediaUrl);

    List<String> getHistoricUserEventIds(String authToken);

    HistoricUserEvent getHistoricUserEvent(String historicUserEventId);
}
