package org.gistic.tweetboard.eventmanager.twitter;

import com.google.common.eventbus.AllowConcurrentEvents;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import org.gistic.tweetboard.datalogic.TweetDataLogic;
import twitter4j.Status;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Created by sohussain on 4/12/15.
 */
public class TweetProcessor {
    private final EventBus bus;
    private final TweetDataLogic tweetDataLogic;
    private final Random random;

    ArrayList<String> filterHashtags = new ArrayList<String>();
    ArrayList<String> badKeywords = new ArrayList<String>();
    public ArrayList<String> blockedUsers = new ArrayList<String>();
    public ArrayList<String> approvedUsers = new ArrayList<String>();
    private TweetsOverTimeAnalyzer tweetsOverTimeAnalyzer = new TweetsOverTimeAnalyzer();
    private ActivePeopleAnalyzer activePeopleAnalyzer = new ActivePeopleAnalyzer();

    public TweetProcessor(EventBus bus, TweetDataLogic tweetDataLogic) {
        this.bus = checkNotNull(bus);
        this.tweetDataLogic = checkNotNull(tweetDataLogic);
        this.random = new Random();
    }

    public void start() throws Exception {
        bus.register(this);
    }

    public void stop() throws Exception {
        bus.unregister(this);
    }

    @Subscribe
    @AllowConcurrentEvents
    public void onStatusUpdate(InternalStatus status) {
    try {
        //new TwitterObjectFactory.createStatus(statusString);
        Status tweet = status.getInternalStatus();
        if (isBlockedUserTweet(tweet)) {
            System.out.println("blocked user detected "
                    + tweet.getUser().getScreenName() + ":" + tweet.getText());
        } else if (isBadKeywordTweet(tweet)) {
            System.out.println("bad tweet detected " + tweet.getText());
        } else {
            activePeopleAnalyzer.TweetArrived(tweet);
            if (isApprovedUser(tweet)) {
                tweetDataLogic.addToApproved(status, true);
            } else {
                tweetDataLogic.newArrived(status);
            }
            tweetsOverTimeAnalyzer.TweetArrived(status);
        }
    } catch (Exception e) { e.printStackTrace(); }
        // Only save 1% of the tweets we see to the database
//        if (random.nextInt(100) < 1) {
//            DateTime now = new DateTime();
//            dao.insert(now, tweet.getText());
//        }
    }

    private boolean isBlockedUserTweet(Status tweet) {
        return containsFromList(tweet.getUser().getScreenName(), blockedUsers);
    }

    private boolean isBadKeywordTweet(Status tweet) {
        return containsFromList(tweet.getText(), badKeywords);
    }


    private boolean isApprovedUser(Status tweet) {
        return containsFromList(tweet.getUser().getScreenName(), approvedUsers);
    }


    private boolean containsFromList(String text, List<String> list) {
        for (String string : list) {
            if (text.contains(string))
                return true;
        }
        return false;
    }

    public List<TweetsOverTimeAnalyzer.TweetsCountPerTime> getTweetsPerTime(int sampleRate, int period) {
        return tweetsOverTimeAnalyzer.getTweetsPerTime(sampleRate, period);
    }
}