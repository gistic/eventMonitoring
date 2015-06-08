package org.gistic.tweetboard.eventmanager;

import com.google.common.eventbus.AsyncEventBus;
import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import org.gistic.tweetboard.dao.TweetDao;
import org.gistic.tweetboard.dao.TweetDaoImpl;
import org.gistic.tweetboard.datalogic.TweetDataLogic;
import org.gistic.tweetboard.eventmanager.twitter.*;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Created by sohussain on 4/7/15.
 */
public class Event {
    private final AsyncEventBus bus;
    private final TweetProcessor tweetProcessor;
    private final TweetDataLogic tweetDataLogic;
    private final boolean v2;
    private final TwitterServiceManagerV2 twitterServiceManagerV2;
    private final String accesstoken;

    public void updateStats

    public String getUuid() {
        return uuid;
    }

    String uuid;
    String[] hashTags;

    public boolean isRunning() {
        return running;
    }

    private volatile boolean running = true;
    //private TwitterService twitterService;

    public Event(String uuid, String[] hashTags, TweetDataLogic tweetDataLogic, boolean v2, String accessToken, TwitterServiceManagerV2 twitterServiceManagerV2) {
        this.v2 = v2;
        this.uuid = uuid;
        this.hashTags = hashTags;
        this.tweetDataLogic = tweetDataLogic;
        this.twitterServiceManagerV2 = twitterServiceManagerV2;
        this.accesstoken = accessToken;
        TwitterConfiguration twitterConfiguration = ConfigurationSingleton.
                getInstance().getTwitterConfiguration();
        bus = new AsyncEventBus(ExecutorSingleton.getInstance());
        if (!v2) {
            TwitterServiceManager.make(twitterConfiguration, bus, hashTags, uuid);
        } else {
            //twitterServiceManagerV2 = new TwitterServiceManagerV2(twitterConfiguration);
            AuthDao authDao = new AuthDaoImpl();
            String accessTokenSecret = authDao.getAccessTokenSecret(accessToken);
            twitterServiceManagerV2.make(bus, hashTags, uuid, accessToken, accessTokenSecret);
        }
        tweetProcessor = new TweetProcessor(bus, tweetDataLogic);
        try {
            tweetProcessor.start();
        } catch (Exception e) {
            LoggerFactory.getLogger(this.getClass()).error("Error: Failure in starting twitter stream logic!");
            e.printStackTrace();
            //TODO: throw
        }
        tweetDataLogic.createNewEvent(hashTags);
    }

    public Event(String uuid, String[] hashTags, TweetDataLogic tweetDataLogic) {
        this(uuid, hashTags, tweetDataLogic, false, null, null); //v2 flag set to false by default for eventmonitoring v1
    }

    public void delete() {
        try {
            running = false;
            if (v2) {
                twitterServiceManagerV2.stop(accesstoken);
            } else {
                TwitterServiceManager.stop(uuid);
            }
            tweetProcessor.stop();
        } catch (Exception e) {
            LoggerFactory.getLogger(this.getClass()).error("Error: Failure in stopping twitter stream logic!");
            e.printStackTrace();
            //TODO: throw
        }
        tweetDataLogic.deleteEvent();
    }

    public InternalStatus getOldestTweetNotSentForApproval() {
        return tweetDataLogic.getOldestTweetNotSentForApproval();
    }

    public InternalStatus getOldestTweetApprovedNotSentToClient() {
        return tweetDataLogic.getOldestTweetApprovedNotSentToClient();
    }

    public void addTrustedUser(String screenName) {
        Boolean exists = false;
        for (String approvedUser: tweetProcessor.approvedUsers) {
            if (screenName.equals(approvedUser)) exists = true;
        }
        if(!exists) tweetProcessor.approvedUsers.add(screenName);
    }

    public void addBlockedUser(String screenName) {
        Boolean exists = false;
        for (String blockedUser: tweetProcessor.blockedUsers) {
            if (screenName.equals(blockedUser)) exists = true;
        }
        if(!exists) tweetProcessor.blockedUsers.add(screenName);
    }

    public List<String> getTrustedUsers() {
        return tweetProcessor.approvedUsers;
    }

    public List<String> getBlockedUsers() {
        return tweetProcessor.blockedUsers;
    }

    public void deleteTrustedUser(String screenName) {
        Boolean exists = false;
        for (String approvedUser: tweetProcessor.approvedUsers) {
            if (screenName.equals(approvedUser)) exists = true;
        }
        if(exists) tweetProcessor.approvedUsers.remove(screenName);
    }

    public void deleteBlockedUser(String screenName) {
        Boolean exists = false;
        for (String blockedUser: tweetProcessor.blockedUsers) {
            if (screenName.equals(blockedUser)) exists = true;
        }
        if(exists) tweetProcessor.blockedUsers.remove(screenName);
    }

    public List<TweetsOverTimeAnalyzer.TweetsCountPerTime> getTweetsPerTime(int sampleRate, int period) {
        return tweetProcessor.getTweetsPerTime(sampleRate, period);
    }

    public void setModeration(boolean moderated) {
        tweetProcessor.setModerated(moderated);
    }
    public void setRetweetsEnabled(boolean retweetsEnabled) { tweetProcessor.setRetweetEnabled(retweetsEnabled); }

    public boolean isModeration() {
        return tweetProcessor.isModerated();
    }
    public boolean isRetweetsEnabled() { return tweetProcessor.isRetweetEnabled(); }

    //TODO rename
    public void postTweetToEvent(InternalStatus iStatus) {
        tweetProcessor.onStatusUpdate(iStatus);
    }
}
