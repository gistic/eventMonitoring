package org.gistic.tweetboard.dao;

import org.apache.commons.lang3.StringUtils;
import org.gistic.tweetboard.JedisPoolContainer;
import org.gistic.tweetboard.datalogic.TweetMeta;
import org.gistic.tweetboard.eventmanager.twitter.InternalStatus;
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
import twitter4j.User;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by sohussain on 4/12/15.
 */
public class TweetDaoImpl implements TweetDao {
    private static final int DEFAULT_TOP_TWEETS_CACHE_DURATION = 60;
    public static final String TWEET_META_DATE_KEY = "CreationDate";
    public static final String TWEET_META_RETWEETS_COUNT_KEY = "RetweetsCount";
    private static final String PLACEHOLDER_MEDIA_URL_KEY = "PlaceholderMedia";
    private static final String TRENDS_KEY = "TrendsKey";
    private static final int DEFAULT_TRENDS_CACHE_DURATION = 60 * 5;
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
            jedis.hset(uuid, HASHTAGS_KEY, "[" + StringUtils.join(hashTags, ",") + "]");
            jedis.hset(uuid, SCREENTIMES_KEY, SCREENTIMES_DEFAULT);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void addToArrived(String uuid, Status tweet, String statusString) {
        String id = String.valueOf(tweet.getId());
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.lpush(getArrivedNotSentListKey(uuid), id);
        }  catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void addNewTweetString(String uuid, Status tweet, String statusString, boolean newArrival) {
        String id = String.valueOf(tweet.getId());
        if (statusString == null || statusString.isEmpty() || id.isEmpty()) {
            LoggerFactory.getLogger(TweetDaoImpl.class).error("Status string empty!"); }
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.set(getTweetIdString(uuid, id), statusString);
//            if (newArrival) {
//                String screenName = String.valueOf(tweet.getUser().getScreenName());
//                String userId = String.valueOf(tweet.getUser().getId());
//                String tweetId = String.valueOf(tweet.getId());
//                //setNewTweetMeta(uuid, tweet, jedis, screenName, userId, tweetId);
//            }
        }  catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    private void setNewTweetMeta(String uuid, Status tweet, Jedis jedis, String screenName, String userId, String tweetId) {
        jedis.sadd(getAllTweetsIdsSetKey(uuid), tweetId);
        jedis.set(getUserIdKey(uuid, screenName), userId);
        jedis.set(getUserProfileImageKey(uuid, screenName), tweet.getUser().getOriginalProfileImageURLHttps());
        jedis.sadd(getUserTweetsSetKey(uuid, userId), tweetId);
        jedis.zincrby(getUsersRankSetKey(uuid), 1, screenName);
        incrTweetRetweetsByN(uuid, tweet.getId(), tweet.getRetweetCount());
    }

    private String getAllTweetsIdsSetKey(String uuid) {
        return uuid+":allTweetsIdsSetKey";
    }

    private String getUserIdKey(String uuid, String screenName) {
        return uuid+":userIdKey:"+screenName;
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
            String statusId = jedis.lpop(getArrivedNotSentListKey(uuid));
            if (statusId == null) return null;
            return getStatus(uuid, statusId);
        } catch (JedisConnectionException e) { LoggerFactory.getLogger(this.getClass()).warn("DB access: error in front end hanging request"); }
        return null;
    }

    @Override
    public void addToApproved(String uuid, String tweetId, boolean starred) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            String statusString = jedis.get(getTweetIdString(uuid, tweetId));
            if (starred) { //TODO: refactor
                statusString = statusString.substring(0, statusString.length()-1).concat(",\"starred\":true}");
            }
            jedis.set(getTweetIdString(uuid, tweetId), statusString);
            jedis.lpush(getApprovedListKey(uuid), tweetId);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    private String getTweetIdString(String uuid, String tweetId) {
        return uuid+":"+tweetId+":tweetJson";
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
            setNewTweetMeta(uuid, tweet, jedis, screenName, userId, tweetId);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    private String getUserProfileImageKey(String uuid, String screenName) {
        return uuid + ":profileImageUrl:" + screenName;
    }

    @Override
    public Set<Tuple> getTopNUsers(String uuid, int topN) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.zrevrangeByScoreWithScores(getUsersRankSetKey(uuid), "+inf", "-inf", 0, topN);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
        return null;
    }

    @Override
    public String getGetUserId(String screenName, String uuid) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.get(getUserIdKey(uuid, screenName));
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
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
        //TODO: error module
        return null;
    }

    @Override
    public void addToApprovedSentToClient(String uuid, String... tweetIds) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            if (tweetIds.length == 0) {
                return;
            }
            jedis.lpush(getApprovedSentToClientListKey(uuid), tweetIds);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public Status getStatus(String uuid, String tweetId) throws TwitterException {
        String statusString = getStatusString(uuid, tweetId);
        if (statusString == null || statusString.isEmpty()) {LoggerFactory.getLogger(this.getClass()).error("status string not found in redis!");}
        return TwitterObjectFactory.createStatus(statusString);
    }

    @Override
    public String getStatusString(String uuid, String tweetId) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.get(getTweetIdString(uuid, tweetId));
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
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
            String userId = jedis.get(getUserIdKey(screenName, uuid));
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
    public String getProfileImageUrl(String uuid, String screenName) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.get(getUserProfileImageKey(uuid, screenName));
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
        return null;
    }

    @Override
    public EventMetaList getEventMetaList() {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            List<String> list = jedis.lrange(All_EVENTS_KEY, 0, -1);
            List<EventMeta> metaList = list.stream()
                    .map(event -> new EventMeta(event,
                            jedis.hget(event, START_TIME_KEY),
                            jedis.hget(event, HASHTAGS_KEY),
                            jedis.hget(event, PLACEHOLDER_MEDIA_URL_KEY))
                    )
                    .collect(Collectors.toList());
            EventMeta[] metaArray = metaList.stream().toArray(EventMeta[]::new);
            BasicStats[] eventStatsArray = new BasicStats[metaArray.length];
            for (int i = 0 ; i < metaArray.length ; i++) {
                eventStatsArray[i] = getBasicStats(metaArray[i].getUuid());
            }
            return new EventMetaList(eventStatsArray, metaArray);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
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
            Long totalMedia = 0l;
            try {
                totalTweets = Long.parseLong(jedis.get(getTotalTweetsKey(uuid)));
            } catch (NumberFormatException e) {}//nothing to log the value is just one
            try {
                totalRetweets =  Long.parseLong(jedis.get(getTotalRetweetsKey(uuid)));
            } catch (NumberFormatException e) {}//nothing to log the value is just one
            try {
                totalMedia =  Long.parseLong(jedis.get(getTotalMediaKey(uuid)));
            } catch (NumberFormatException e) {}//nothing to log the value is just one
            String startTime = jedis.hget(uuid, START_TIME_KEY);
            return new BasicStats(startTime, numberOfUsers, totalTweets, totalRetweets, totalMedia);
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
        return null;
    }

    @Override
    public List<String> getAllTweetIdsSentForApprovalAndDeleteFromSentForApproval(String uuid) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            List<String> tweetIds = jedis.lrange(getSentForApprovalListKey(uuid), 0, -1);
            jedis.del(getSentForApprovalListKey(uuid));
            return tweetIds;
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
        return null;
    }

    @Override
    public void deleteTweetJson(String uuid, String tweetId) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.del(getTweetIdString(uuid, tweetId));
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void setNewTweetMeta(String uuid, InternalStatus status) {
        Status tweet = status.getInternalStatus();
        User user = tweet.getUser();
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            setNewTweetMeta(uuid, tweet, jedis, tweet.getUser().getScreenName(), String.valueOf(user.getId()),
                    String.valueOf(tweet.getId()));
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void setNewTweetMeta(String uuid, Status tweet) {
        User user = tweet.getUser();
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            setNewTweetMeta(uuid, tweet, jedis, tweet.getUser().getScreenName(), String.valueOf(user.getId()),
                    String.valueOf(tweet.getId()));
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public Double incrCountryCounter(String uuid, String countryCode) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.zincrby(getCountryRankSetKey(uuid), 1, countryCode);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        return 0.0;
    }
    public void incrMedia(String uuid) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.incr(getTotalMediaKey(uuid));
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void setTweetMetaDate(String uuid, long retweetedStatusId, long retweetCreatedAt) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            String createdAtString = Long.toString(retweetCreatedAt);
            if(createdAtString== null || createdAtString.isEmpty()) System.out.println("EERRRRROOOORRRR  EERRRRORRRRRR");
            jedis.hset(getTweetMetaKey(uuid, Long.toString(retweetedStatusId)), TWEET_META_DATE_KEY, createdAtString);
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void incrTweetRetweets(String uuid, long retweetedStatusId) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.hincrBy(getTweetMetaKey(uuid, Long.toString(retweetedStatusId)), TWEET_META_RETWEETS_COUNT_KEY, 1);
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void incrTweetRetweetsByN(String uuid, long retweetedStatusId, int n) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.hincrBy(getTweetMetaKey(uuid, Long.toString(retweetedStatusId)), TWEET_META_RETWEETS_COUNT_KEY, n);
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public String getTopTweetsGeneratedFlag(String uuid) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.get(getTopTweetsGeneratedFlagKey(uuid));
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    @Override
    public void setTopTweetsGeneratedFlag(String uuid) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.set(getTopTweetsGeneratedFlagKey(uuid), "true");
            jedis.expire(getTopTweetsGeneratedFlagKey(uuid), DEFAULT_TOP_TWEETS_CACHE_DURATION);
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public Set<String> getKeysWithPattern(String pattern) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.keys(pattern);
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    @Override
    public TweetMeta getTweetMeta(String key) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            //System.out.println("key is get tweet meta is: "+key);
            long date = 0l;
            try {
                date = Long.parseLong(jedis.hget(key, TWEET_META_DATE_KEY));
            } catch (NumberFormatException e) {
                e.printStackTrace();
            }
            String retweetsStr = jedis.hget(key, TWEET_META_RETWEETS_COUNT_KEY);
            long retweetsCount = 0l;
            if (retweetsStr!=null) retweetsCount = Long.parseLong(retweetsStr);
            return new TweetMeta(date, retweetsCount);
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    @Override
    public void setTweetScore(String uuid, String tweetId, double score) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.zadd(getTweetScoreSortedSetKey(uuid), score, tweetId);
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void deleteTopTweetsSortedSet(String uuid) {
        try(Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.del(getTweetScoreSortedSetKey(uuid));
        } catch(JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public Set<Tuple> getTopNTweets(String uuid, int n) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.zrevrangeByScoreWithScores(getTweetScoreSortedSetKey(uuid), "+inf", "-inf", 0, n);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
        return null;
    }

    @Override
    public Long addToCache(String uuid, InternalStatus status) {
        Status tweet = status.getInternalStatus();
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            //jedis.set(getTweetIdString(uuid, id), statusString);
            return jedis.lpush(getTweetCacheKey(uuid), String.valueOf(tweet.getId()));
        }  catch (JedisException jE) {
            jE.printStackTrace();
        }
        return 0l;
    }

    @Override
    public String popFromCache(String uuid) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.rpop(getTweetCacheKey(uuid));
        }  catch (JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    @Override
    public void addToTweetStringCache(String uuid, InternalStatus status) {
        String id = String.valueOf(status.getInternalStatus().getId());
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.set(getTweetStringCache(uuid, id), status.getStatusString().replace("_normal", ""));
        }
    }

    @Override
    public void removeFromTweetStringCache(String uuid, String poppedTweetId) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.del(getTweetStringCache(uuid, poppedTweetId));
        }
    }

    @Override
    public String getTweetStringsCache(String uuid, String id) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.get(getTweetStringCache(uuid, id));
        } catch (JedisException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public List<String> getIdsFromTweetCache(String uuid) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            //jedis.set(getTweetIdString(uuid, id), statusString);
            return jedis.lrange(getTweetCacheKey(uuid), 0, -1);
        }  catch (JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    @Override
    public Set<String> getAllTweetsIds(String uuid) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            //jedis.set(getTweetIdString(uuid, id), statusString);
            return jedis.smembers(getAllTweetsIdsSetKey(uuid));
        }  catch (JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    private String getTweetStringCache(String uuid, String id) {
        return uuid+":tweetStringCache:"+id;
    }

    private String getTweetCacheKey(String uuid) {
        return uuid + ":tweetCacheList";
    }

    private String getTweetScoreSortedSetKey(String uuid) {
        return uuid+":tweetScoreSortedSetKey";
    }

    private String getTopTweetsGeneratedFlagKey(String uuid) {
        return uuid+":topTweetsGeneratedFlagKey";
    }

//    private String getTweetMetaDateKey(String uuid, String retweetedStatusId) {
//        return uuid+":tweetMeta:"+retweetedStatusId+":"+ TWEET_META_DATE_KEY;
//    }
//
//    private String getTweetRetweetsCountKey(String uuid, String retweetedStatusId) {
//        return uuid+":tweetMeta:"+retweetedStatusId+":"+ TWEET_META_RETWEETS_COUNT_KEY;
//    }

    public String getTweetMetaKey(String uuid, String retweetedStatusId) {
        return uuid+":tweetMeta:"+retweetedStatusId;
    }

    @Override
    public void incrLanguageCounter(String uuid, String language) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.zincrby(getLanguageRankSetKey(uuid), 1, language);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void incrHashtagCounter(String uuid, String hashtag) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.zincrby(getHashtagRankSetKey(uuid), 1, hashtag);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void incrWordCounter(String uuid, String word) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.zincrby(getWordRankSetKey(uuid), 1, word);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void setMediaUrl(String uuid, String mediaURLHttps) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.hset(uuid, PLACEHOLDER_MEDIA_URL_KEY, mediaURLHttps);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }

    }

    @Override
    public String[] getTrendingHashtags() {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            List<String> hashtags = jedis.lrange(TRENDS_KEY, 0, -1);
            return (hashtags == null || hashtags.isEmpty()) ? null : hashtags.toArray(new String[]{});
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    @Override
    public void setTrendindHashtags(String[] hashtags) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            jedis.rpush(TRENDS_KEY, hashtags);
            jedis.expire(TRENDS_KEY, DEFAULT_TRENDS_CACHE_DURATION);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public Set<Tuple> getTopNCountries(String uuid, Integer count) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.zrevrangeByScoreWithScores(getCountryRankSetKey(uuid), "+inf", "-inf", 0, count);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
        return null;
    }

    @Override
    public Set<Tuple> getTopNLanguages(String uuid, Integer count) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.zrevrangeByScoreWithScores(getLanguageRankSetKey(uuid), "+inf", "-inf", 0, count);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
        return null;
    }

    @Override
    public Set<Tuple> getTopNHashtags(String uuid, Integer count) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.zrevrangeByScoreWithScores(getHashtagRankSetKey(uuid), "+inf", "-inf", 0, count);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
        return null;
    }

    @Override
    public Set<Tuple> getTopNWords(String uuid, Integer count) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            return jedis.zrevrangeByScoreWithScores(getWordRankSetKey(uuid), "+inf", "-inf", 0, count);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        //TODO: error module
        return null;
    }
    private String getTotalMediaKey(String uuid) {
        return uuid + ":totalMedia";
    }

    @Override
    public void blockAllExistingTweetsByUser(String uuid, String screenName) {
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
            String userId = jedis.get(getUserIdKey(screenName, uuid));
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
                    getSentForApprovalListKey(uuid), getTotalTweetsKey(uuid), getTotalRetweetsKey(uuid), getCountryRankSetKey(uuid));
            Set<String> keys = jedis.keys(uuid + ":*");
            for (String key:keys) {
                jedis.del(key);
            }
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

    private String getCountryRankSetKey(String uuid) {
        return uuid + ":countryRank";
    }

    private String getLanguageRankSetKey(String uuid) {
        return uuid + ":languageRank";
    }

    private String getHashtagRankSetKey(String uuid) {
        return uuid + ":hashtagRank";
    }

    private String getWordRankSetKey(String uuid) {
        return uuid + ":wordRank";
    }
}
