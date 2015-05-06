package org.gistic.tweetboard.datalogic;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.gistic.tweetboard.dao.TweetDao;
import org.gistic.tweetboard.eventmanager.Message;
import org.gistic.tweetboard.eventmanager.twitter.InternalStatus;
import org.gistic.tweetboard.representations.BasicStats;
import org.gistic.tweetboard.representations.EventConfig;
import org.gistic.tweetboard.representations.TopUser;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Tuple;
import twitter4j.Status;
import twitter4j.TwitterException;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Created by sohussain on 4/12/15.
 */
public class TweetDataLogic {
    private TweetDao tweetDao;
    String uuid;

    public TweetDataLogic(TweetDao tweetDao, String uuid) {
        this.tweetDao = tweetDao;
        this.uuid = uuid;
    }

    public void addToApproved(InternalStatus status, boolean newArrival) {
        Status tweet = status.getInternalStatus();
        //User u = tweet.getUser();
        String tweetString = status.getStatusString();
        tweetDao.addNewTweetString(uuid, tweet, tweetString, newArrival);
        addToApproved(tweet);
    }

    public void addToApproved(Status tweet) {
        String tweetId = String.valueOf(tweet.getId());
        addToApproved(tweetId, false);
    }

    public void addToApproved(String tweetId, boolean starred) {
        tweetDao.removeFromSentForApproval(uuid, tweetId);
        tweetDao.addToApproved(uuid, tweetId, starred);
        String statusString = tweetDao.getStatusString(tweetId);
        Client client = ClientBuilder.newClient();
        WebTarget target = client.target("http://127.0.0.1:8080/api/liveTweets");
        Message msg = new Message(uuid, Message.Type.LiveTweet, statusString);
        target.request().post(Entity.entity(msg, MediaType.APPLICATION_JSON), Message.class);
    }

    public void addToBlocked(String tweetId) {
        tweetDao.removeFromSentForApproval(uuid, tweetId);
    }

    public InternalStatus addToApprovedSentToClient() throws TwitterException {
        String tweetId = tweetDao.removeFromApproved(uuid);
        LoggerFactory.getLogger(this.getClass()).debug("");
        if (tweetId == null || tweetId.isEmpty()) return null;
        tweetDao.addToApprovedSentToClient(uuid, tweetId);
        Status status = tweetDao.getStatus(tweetId);
        String statusString = tweetDao.getStatusString(tweetId);
        return new InternalStatus(status, statusString);
    }

    public void newArrived(InternalStatus tweet) {
        tweetDao.addNewTweetString(uuid, tweet.getInternalStatus(), tweet.getStatusString(), false);
        tweetDao.addToArrived(uuid, tweet.getInternalStatus(), tweet.getStatusString());
        tweetDao.addToUserTweetsSet(uuid, tweet.getInternalStatus());
    }

    public void createNewEvent(String[] hashTags) {
        tweetDao.addNewEventToList(uuid);
        tweetDao.setDefaultEventProperties(uuid, hashTags);
    }

    public InternalStatus getOldestTweetNotSentForApproval() {
        try {
            Status status = tweetDao.getOldestTweetNotSentForApproval(uuid);
            if (status == null) return null;
            String statusId = String.valueOf(status.getId());
            tweetDao.addToSentForApproval(uuid, statusId);
            return new InternalStatus(status, tweetDao.getStatusString(statusId));
        } catch (TwitterException e) {
            LoggerFactory.getLogger(this.getClass()).error("error in parsing tweet string to status object");
            return null;
        }
    }

    public InternalStatus getOldestTweetApprovedNotSentToClient() {
        try {
            return addToApprovedSentToClient();
        } catch (TwitterException e) {
            return null;
        }
    }

    public void deleteEvent() {
        //TODO : test
        tweetDao.destroyEvent(uuid);
    }

    public void updateEventConfig(EventConfig eventConfig) {
        tweetDao.updateEventConfig(uuid, eventConfig);
        Client client = ClientBuilder.newClient();
        WebTarget target = client.target("http://127.0.0.1:8080/api/liveTweets");
        String configString = "";
        try {
            configString = new ObjectMapper().writeValueAsString(eventConfig);
        } catch (JsonProcessingException e) {
            LoggerFactory.getLogger(this.getClass()).error("Error converting pojo, SHOULD NEVER HAPPEN");
        }
        Message msg = new Message(uuid, Message.Type.UiUpdate, configString);
        target.request().post(Entity.entity(msg, MediaType.APPLICATION_JSON), Message.class);
    }

    public EventConfig getEventConfig(String uuid) {
        return tweetDao.getEventConfig(uuid);
    }

    public void approveAllExistingTweetsByUser(String screenName) {
        tweetDao.approveAllExistingTweetsByUser(uuid, screenName);
    }
    public void blockAllExistingTweetsByUser(String screenName) {
        tweetDao.blockAllExistingTweetsByUser(uuid, screenName);
    }

    public List<TopUser> getTopTenNUsers(Integer count) {
        Set<Tuple> topUsers = tweetDao.getTopNUsers(uuid, count);

        return topUsers.stream()
                .map(user -> new TopUser(tweetDao.getGetUserId(user.getElement()), user.getElement(), user.getScore(),
                        tweetDao.getProfileImageUrl(user.getElement())))
                .collect(Collectors.toList());
    }

    public BasicStats getBasicStats(String uuid) {
        return tweetDao.getBasicStats(uuid);
    }

    public void incrTotalRetweets() {
        tweetDao.incrRetweets(uuid);
    }

    public void incrOriginalTweets() {
        tweetDao.incrTweets(uuid);
    }
}
