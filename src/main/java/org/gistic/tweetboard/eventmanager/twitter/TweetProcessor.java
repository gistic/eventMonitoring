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
    //TODO: is this even used???
    private ActivePeopleAnalyzer activePeopleAnalyzer = new ActivePeopleAnalyzer();

    public boolean isModerated() {
        return moderated;
    }

    public void setModerated(boolean moderated) {
        this.moderated = moderated;
    }

    private boolean moderated = true;

    private boolean retweetEnabled = true;

    public boolean isRetweetEnabled() {
        return retweetEnabled;
    }

    public void setRetweetEnabled(boolean retweetEnabled) {
        this.retweetEnabled = retweetEnabled;
    }

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
        Status tweet = status.getInternalStatus();
        if(tweet.isRetweet() || tweet.getText().contains("RT")) {
            tweetDataLogic.incrTotalRetweets();
        } else {
            tweetDataLogic.incrOriginalTweets();
        }

        activePeopleAnalyzer.TweetArrived(tweet);
        tweetsOverTimeAnalyzer.TweetArrived(status);

        if (retweetEnabled) {
            checkModeratedAndThen(status, tweet);
        } else {
            if (tweet.isRetweet() || tweet.getText().contains("RT")) {
                tweetDataLogic.setNewTweetMeta(status);
            } else {
                checkModeratedAndThen(status, tweet);
            }
        }
//    try {
//        Status tweet = status.getInternalStatus();
//        if(tweet.isRetweet()) {
//            tweetDataLogic.incrTotalRetweets();
//        } else {
//            tweetDataLogic.incrOriginalTweets();
//        }
//        if (!moderated) {
//            if (!retweetEnabled && tweet.isRetweet()) {
//                tweetDataLogic.setNewTweetMeta(status);
//                return;
//            }
//            tweetDataLogic.addToApproved(status, true);
//            return;
//        }
//        // if moderation in enabled, then
//        if (isBlockedUserTweet(tweet)) {
//            tweetDataLogic.setNewTweetMeta(status);
//            System.out.println("blocked user detected "
//                    + tweet.getUser().getScreenName() + ":" + tweet.getText());
//        } else if (isBadKeywordTweet(tweet)) {
//            tweetDataLogic.setNewTweetMeta(status);
//            System.out.println("bad tweet detected " + tweet.getText());
//        } else {
//            tweet.getUser().getOriginalProfileImageURLHttps();
//            activePeopleAnalyzer.TweetArrived(tweet);
//            if (isApprovedUser(tweet)) {
//                if (!retweetEnabled && tweet.isRetweet()) {
//                    tweetDataLogic.setNewTweetMeta(status);
//                } else {
//                    tweetDataLogic.addToApproved(status, true);
//                }
//            } else {
//                if (!retweetEnabled && tweet.isRetweet()) {
//                    tweetDataLogic.setNewTweetMeta(status);
//                } else {
//                    tweetDataLogic.newArrived(status);
//                }
//            }
//            tweetsOverTimeAnalyzer.TweetArrived(status);
//        }
//    } catch (Exception e) { e.printStackTrace(); }
        // Only save 1% of the tweets we see to the database
//        if (random.nextInt(100) < 1) {
//            DateTime now = new DateTime();
//            dao.insert(now, tweet.getText());
//        }
    }

    private void checkModeratedAndThen(InternalStatus status, Status tweet) {
        if (moderated) {
            if (isBlockedUserTweet(tweet) || isBadKeywordTweet(tweet)) {
                tweetDataLogic.setNewTweetMeta(status);
                System.out.println("blocked user detected "
                        + tweet.getUser().getScreenName() + ":" + tweet.getText());
                System.out.println(" OR bad tweet detected " + tweet.getText());
            } else {
//                tweet.getUser().getOriginalProfileImageURLHttps();
//                    activePeopleAnalyzer.TweetArrived(tweet);
                if (isApprovedUser(tweet)) {
                        tweetDataLogic.addToApproved(status, true);
                } else {
                    tweetDataLogic.newArrived(status);
                }
//                    tweetsOverTimeAnalyzer.TweetArrived(status);
            }
        } else {
            tweetDataLogic.addToApproved(status, true);
        }
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
