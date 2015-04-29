package org.gistic.tweetboard.dao;

import org.apache.commons.lang.StringUtils;
import org.eclipse.jetty.util.StringUtil;
import org.gistic.tweetboard.JedisPoolContainer;
import org.gistic.tweetboard.representations.EventConfig;
import org.gistic.tweetboard.representations.EventMeta;
import org.gistic.tweetboard.representations.EventMetaList;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.Tuple;
import redis.clients.jedis.exceptions.JedisConnectionException;
import twitter4j.Status;
import twitter4j.TwitterException;
import twitter4j.TwitterObjectFactory;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by sohussain on 4/12/15.
 */
public class TweetDaoImpl implements TweetDao {
    //private Jedis jedis;
    final String All_EVENTS_KEY = "event";
    final String BG_COLOR_KEY = "banckGroundColor";
    final String BG_COLOR_DEFAULT = "blue";
    final String SIZE_KEY = "size";
    final String SIZE_DEAFULT = "normal";
    final String SCREENS_KEY = "screens";
    final String SCREENS_DEFAULT = "[\"/live\", \"/top\", \"/overtime\"]";
    final String START_TIME_KEY = "startTime";
    final String HASHTAGS_KEY = "hashTags";

    public TweetDaoImpl() {
        //this.jedis = jedis;
//        ConfigurationSingleton.getInstance().getJedisFactory().
//        JedisPool pool = new JedisPool(new JedisPoolConfig(), "localhost");
    }

    @Override
    public void addNewEventToList(String uuid) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            jedis.lpush(All_EVENTS_KEY, uuid);
        }
    }

    @Override
    public void setDefaultEventProperties(String uuid, String[] hashTags) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.hset(uuid, BG_COLOR_KEY, BG_COLOR_DEFAULT);
            jedis.hset(uuid, SIZE_KEY, SIZE_DEAFULT);
            jedis.hset(uuid, SCREENS_KEY, SCREENS_DEFAULT);
            Date d =new Date();
            String time = d.toLocaleString();
            jedis.hset(uuid, START_TIME_KEY, time);
            jedis.hset(uuid, HASHTAGS_KEY, StringUtils.join(hashTags, ","));
        }
    }

    @Override
    public void addToArrived(String uuid, Status tweet, String statusString) {
        String id = String.valueOf(tweet.getId());
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.set(id, statusString);
            jedis.lpush(getArrivedNotSentListKey(uuid), id);
        }
    }

    @Override
    public void addNewTweetString(String uuid, Status tweet, String statusString, boolean newArrival) {
        String id = String.valueOf(tweet.getId());
        if (statusString == null || statusString.isEmpty() || id == null || id.isEmpty()) {
            LoggerFactory.getLogger(TweetDaoImpl.class).error("Status string empty!"); }
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.set(id, statusString);
            if (newArrival) {
                String screenName = String.valueOf(tweet.getUser().getScreenName());
                String userId = String.valueOf(tweet.getUser().getId());
                String tweetId = String.valueOf(tweet.getId());
                jedis.set(screenName, userId);
                jedis.set(getUserProfileImageKey(screenName), tweet.getUser().getOriginalProfileImageURLHttps());
                jedis.sadd(getUserTweetsSetKey(uuid, userId), tweetId);
                jedis.zincrby(getUsersRankSetKey(uuid), 1, screenName);
            }
        } catch (Exception e) { LoggerFactory.getLogger(TweetDaoImpl.class).error("Status string could not be saved!");  }
    }

    @Override
    public void removeFromArrived(String uuid, String id) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.lrem(getArrivedNotSentListKey(uuid), 0, id);
        }
    }

    @Override
    public void addToSentForApproval(String uuid, String id) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.lpush(getSentForApprovalListKey(uuid), id);
        }
    }

    @Override
    public Status getOldestTweetNotSentForApproval(String uuid) throws TwitterException {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            String statusId = jedis.rpop(getArrivedNotSentListKey(uuid));
            if (statusId == null) return null;
            return getStatus(statusId);
        } catch (JedisConnectionException e) { LoggerFactory.getLogger(this.getClass()).warn("DB access: error in front end hanging request"); }
        return null;
    }

    @Override
    public void addToApproved(String uuid, String tweetId, boolean starred) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            String statusString = jedis.get(tweetId);
            if (starred) { //TODO: refactor
                statusString = statusString.substring(0, statusString.length()-1).concat("\"starred\":true}");
            }
            jedis.set(tweetId, statusString);
            jedis.lpush(getApprovedListKey(uuid), tweetId);
        }
    }

    private String getApprovedListKey(String uuid) {
        return uuid + ":Approved";
    }

    @Override
    public void removeFromSentForApproval(String uuid, String tweetId) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.lrem(getSentForApprovalListKey(uuid), 0, tweetId);
        }
    }

    @Override
    public void addToUserTweetsSet(String uuid, Status tweet) {
        String screenName = String.valueOf(tweet.getUser().getScreenName());
        String userId = String.valueOf(tweet.getUser().getId());
        String tweetId = String.valueOf(tweet.getId());
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.set(screenName, userId);
            jedis.set(getUserProfileImageKey(screenName), tweet.getUser().getOriginalProfileImageURLHttps());
            jedis.sadd(getUserTweetsSetKey(uuid, userId), tweetId);
            jedis.zincrby(getUsersRankSetKey(uuid), 1, screenName);
            //jedis.zrevrangeByScore(getUsersRankSetKey(uuid), "+", "-", 0, 5);
        }
    }

    private String getUserProfileImageKey(String screenName) {
        return screenName + ":profileImageUrl";
    }

    @Override
    public Set<Tuple> getTopNUsers(String uuid, int topN) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.zrevrangeByScoreWithScores(getUsersRankSetKey(uuid), "+inf", "-inf", 0, topN);
        }
    }

    @Override
    public String getGetUserId(String screenName) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.get(screenName);
        }
    }

    private String getUsersRankSetKey(String uuid) {
        return uuid + ":usersRank";
    }

    @Override
    public String removeFromApproved(String uuid) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.rpop(getApprovedListKey(uuid));
        }
    }

    @Override
    public void addToApprovedSentToClient(String uuid, String tweetId) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.lpush(getApprovedSentToClientListKey(uuid), tweetId);
        }
    }

    @Override
    public Status getStatus(String tweetId) throws TwitterException {
        String statusString = getStatusString(tweetId);
        if (statusString == null || statusString.isEmpty()) {LoggerFactory.getLogger(this.getClass()).error("status string not found in redis!");}
        return TwitterObjectFactory.createStatus(statusString);
    }

    @Override
    public String getStatusString(String tweetId) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.get(tweetId);
        }
    }

    @Override
    public void updateEventConfig(String uuid, EventConfig eventConfig) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.hset(uuid, BG_COLOR_KEY, eventConfig.getBackgroundColor());
            jedis.hset(uuid, SIZE_KEY, eventConfig.getSize());
            jedis.hset(uuid, SCREENS_KEY, Arrays.toString(eventConfig.getScreens()));
        }
    }

    @Override
    public EventConfig getEventConfig(String uuid) {
        EventConfig eventConfig = new EventConfig();
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            eventConfig.setBackgroundColor(jedis.hget(uuid, BG_COLOR_KEY));
            eventConfig.setSize(jedis.hget(uuid, SIZE_KEY));
            String screens = jedis.hget(uuid, SCREENS_KEY);
            String[] screensArray = (String[])Arrays
                    .stream(screens.substring(1, screens.length() - 1).split(","))
                    .map(String::trim).toArray();
            eventConfig.setScreens(screensArray);
        }
        return eventConfig;
    }

    @Override
    public void approveAllExistingTweetsByUser(String uuid, String screenName) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            String userId = jedis.get(screenName);
            Set<String> tweetIds = jedis.smembers(getUserTweetsSetKey(uuid, userId));
            for (String tweetId : tweetIds) {
                removeFromArrived(uuid, tweetId);
                removeFromSentForApproval(uuid, tweetId);
                addToApproved(uuid, tweetId, false);
            }
        }
    }

    @Override
    public String getProfileImageUrl(String screenName) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.get(getUserProfileImageKey(screenName));
        }
    }

    @Override
    public EventMetaList getEventMetaList() {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            List<String> list = jedis.lrange(All_EVENTS_KEY, 0, -1);
            List<EventMeta> metaList = list.stream()
                    .map(event -> new EventMeta(event,
                            jedis.hget(event, START_TIME_KEY), jedis.hget(event, HASHTAGS_KEY)))
                    .collect(Collectors.toList());
            EventMeta[] metaArray = metaList.stream().toArray(EventMeta[]::new);
            return new EventMetaList(metaArray);
        }
    }

    @Override
    public void blockAllExistingTweetsByUser(String uuid, String screenName) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            String userId = jedis.get(screenName);
            Set<String> tweetIds = jedis.smembers(getUserTweetsSetKey(uuid, userId));
            for (String tweetId : tweetIds) {
                removeFromArrived(uuid, tweetId);
                removeFromSentForApproval(uuid, tweetId);
            }
        }
    }

    @Override
    public void destroyEvent(String uuid) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.lrem(All_EVENTS_KEY, 0, uuid);
            jedis.del(uuid, getArrivedNotSentListKey(uuid), getApprovedSentToClientListKey(uuid),
                    getSentForApprovalListKey(uuid));
            //jedis.hdel(uuid);
        }
    }

    private String getUserTweetsSetKey(String uuid, String userId) {
        return uuid + ":userTweetsSet:" + userId;
    }

    private String getSentForApprovalListKey(String uuid) {
        return uuid + ":sentForApproval";
    }

    private String getApprovedSentToClientListKey(String uuid) {
        return uuid + ":approvedSentToClient";
    }

    private String getArrivedNotSentListKey(String uuid) {
        return uuid + ":arrivedNotSent";
    }
}
