package org.gistic.tweetboard.eventmanager;

import com.google.common.eventbus.AsyncEventBus;
import org.gistic.tweetboard.ConfigurationSingleton;
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
    String uuid;
    String[] hashTags;
    //private TwitterService twitterService;

    public Event(String uuid, String[] hashTags, TweetDataLogic tweetDataLogic) {
        this.uuid = uuid;
        this.hashTags = hashTags;
        this.tweetDataLogic = tweetDataLogic;
        bus = new AsyncEventBus(ExecutorSingleton.getInstance());
        TwitterServiceManager.make(ConfigurationSingleton.
                getInstance().getTwitterConfiguration(), bus, hashTags, uuid);
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

    public void delete() {
        try {
            TwitterServiceManager.stop(uuid);
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
}
