package org.gistic.tweetboard.dao;

import org.apache.commons.lang3.StringUtils;
import org.gistic.tweetboard.JedisPoolContainer;
import org.gistic.tweetboard.representations.BasicStats;
import org.gistic.tweetboard.representations.EventConfig;
import org.gistic.tweetboard.representations.EventMeta;
import org.gistic.tweetboard.representations.EventMetaList;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.Tuple;
import redis.clients.jedis.exceptions.JedisConnectionException;
import redis.clients.jedis.exceptions.JedisException;
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
    final String SCREENS_DEFAULT = "[/live, /top, /overtime]";
    final String START_TIME_KEY = "startTime";
    final String HASHTAGS_KEY = "hashTags";
    final String SCREENTIMES_KEY = "screensTime";
    final String SCREENTIMES_DEFAULT = "[12000, 12000, 12000]";

    public TweetDaoImpl() {
        //this.jedis = jedis;
//        ConfigurationSingleton.getInstance().getJedisFactory().
//        JedisPool pool = new JedisPool(new JedisPoolConfig(), "localhost");
    }

    @Override
    public void addNewEventToList(String uuid) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            jedis.lpush(All_EVENTS_KEY, uuid);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void setDefaultEventProperties(String uuid, String[] hashTags) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.hset(uuid, BG_COLOR_KEY, BG_COLOR_DEFAULT);
            jedis.hset(uuid, SIZE_KEY, SIZE_DEAFULT);
            jedis.hset(uuid, SCREENS_KEY, SCREENS_DEFAULT);
            Date d =new Date();
            String time = d.toGMTString();
            jedis.hset(uuid, START_TIME_KEY, time);
            jedis.hset(uuid, HASHTAGS_KEY, "["+StringUtils.join(hashTags, ",")+"]");
            jedis.hset(uuid, SCREENTIMES_KEY, SCREENTIMES_DEFAULT);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void addToArrived(String uuid, Status tweet, String statusString) {
        String id = String.valueOf(tweet.getId());
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.set(id, statusString);
            jedis.lpush(getArrivedNotSentListKey(uuid), id);
        }  catch (JedisException jE) {
            jE.printStackTrace();
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
        }  catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void removeFromArrived(String uuid, String id) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.lrem(getArrivedNotSentListKey(uuid), 0, id);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void addToSentForApproval(String uuid, String id) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.lpush(getSentForApprovalListKey(uuid), id);
        } catch (JedisException jE) {
            jE.printStackTrace();
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
                statusString = statusString.substring(0, statusString.length()-1).concat(",\"starred\":true}");
            }
            jedis.set(tweetId, statusString);
            jedis.lpush(getApprovedListKey(uuid), tweetId);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    private String getApprovedListKey(String uuid) {
        return uuid + ":Approved";
    }

    @Override
    public void removeFromSentForApproval(String uuid, String tweetId) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.lrem(getSentForApprovalListKey(uuid), 0, tweetId);
        } catch (JedisException jE) {
            jE.printStackTrace();
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
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    private String getUserProfileImageKey(String screenName) {
        return screenName + ":profileImageUrl";
    }

    @Override
    public Set<Tuple> getTopNUsers(String uuid, int topN) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.zrevrangeByScoreWithScores(getUsersRankSetKey(uuid), "+inf", "-inf", 0, topN);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: handle error in callers
        return null;
    }

    @Override
    public String getGetUserId(String screenName) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.get(screenName);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: handle error in callers
        return null;
    }

    private String getUsersRankSetKey(String uuid) {
        return uuid + ":usersRank";
    }

    @Override
    public String removeFromApproved(String uuid) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.rpop(getApprovedListKey(uuid));
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: handle error in callers
        return null;
    }

    @Override
    public void addToApprovedSentToClient(String uuid, String tweetId) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.lpush(getApprovedSentToClientListKey(uuid), tweetId);
        } catch (JedisException jE) {
            jE.printStackTrace();
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
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: handle error in callers
        return null;
    }

    @Override
    public void updateEventConfig(String uuid, EventConfig eventConfig) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.hset(uuid, BG_COLOR_KEY, eventConfig.getBackgroundColor());
            jedis.hset(uuid, SIZE_KEY, eventConfig.getSize());
            jedis.hset(uuid, SCREENS_KEY, Arrays.toString(eventConfig.getScreens()));
            jedis.hset(uuid, SCREENTIMES_KEY, Arrays.toString(eventConfig.getScreenTimes()));
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public EventConfig getEventConfig(String uuid) {
        EventConfig eventConfig = new EventConfig();
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            eventConfig.setBackgroundColor(jedis.hget(uuid, BG_COLOR_KEY));
            eventConfig.setSize(jedis.hget(uuid, SIZE_KEY));
            String screens = jedis.hget(uuid, SCREENS_KEY);
            String[] screensArray = getStringArray(screens);
            eventConfig.setScreens(screensArray);
            String screenTimesStr = jedis.hget(uuid, SCREENTIMES_KEY);
            int[] screenTimes = Arrays.stream(screenTimesStr.substring(1, screenTimesStr.length()-1).split(","))
                    .map(String::trim).mapToInt(Integer::parseInt).toArray();
            eventConfig.setScreenTimes(screenTimes);
            String hashtagsString = jedis.hget(uuid, HASHTAGS_KEY);
            String[] hashtagsArray = getStringArray(hashtagsString);
            eventConfig.setHashtags(hashtagsArray);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        return eventConfig;
    }

    private String[] getStringArray(String arrayAsString) {
        Object[] objectHashtagsArray =
                Arrays
                        .stream(arrayAsString.substring(1, arrayAsString.length() - 1).split(","))
                        .map(String::trim)
                        .toArray();
        return Arrays.copyOf(objectHashtagsArray, objectHashtagsArray.length, String[].class);
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
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public String getProfileImageUrl(String screenName) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.get(getUserProfileImageKey(screenName));
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: handle error in callers
        return null;
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
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: handle error in callers
        return null;
    }

    @Override
    public void incrRetweets(String uuid) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.incr(getTotalRetweetsKey(uuid));
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    private String getTotalRetweetsKey(String uuid) {
        return uuid + ":totalRetweets";
    }

    @Override
    public void incrTweets(String uuid) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.incr(getTotalTweetsKey(uuid));
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    private String getTotalTweetsKey(String uuid) {
        return uuid + ":totalTweets";
    }

    @Override
    public BasicStats getBasicStats(String uuid) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            Long numberOfUsers = jedis.zcard(getUsersRankSetKey(uuid));
            Long totalTweets = 0l;
            Long totalRetweets = 0l;
            try {
                totalTweets = Long.parseLong(jedis.get(getTotalTweetsKey(uuid)));
            } catch (NumberFormatException e) {}//nothing to log the value is just one
            try {
                totalRetweets =  Long.parseLong(jedis.get(getTotalRetweetsKey(uuid)));
            } catch (NumberFormatException e) {}//nothing to log the value is just one
            String startTime = jedis.hget(uuid, START_TIME_KEY);
            return new BasicStats(startTime, numberOfUsers, totalTweets, totalRetweets);
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
        //TODO throw
        return null;
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
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void destroyEvent(String uuid) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.lrem(All_EVENTS_KEY, 0, uuid);
            jedis.del(uuid, getArrivedNotSentListKey(uuid), getApprovedSentToClientListKey(uuid),
                    getSentForApprovalListKey(uuid), getTotalTweetsKey(uuid), getTotalRetweetsKey(uuid));
        } catch (JedisException jE) {
            jE.printStackTrace();
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
