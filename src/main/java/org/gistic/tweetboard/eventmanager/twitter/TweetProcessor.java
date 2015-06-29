package org.gistic.tweetboard.eventmanager.twitter;

import com.google.common.eventbus.AllowConcurrentEvents;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.datalogic.TweetDataLogic;
import org.gistic.tweetboard.util.Misc;
import org.slf4j.LoggerFactory;
import twitter4j.HashtagEntity;
import twitter4j.Place;
import twitter4j.MediaEntity;
import twitter4j.Status;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
        try {
            bus.unregister(this);
        } catch(IllegalArgumentException e) {
            LoggerFactory.getLogger(this.getClass()).info("Bus already unregistered.");
        }
    }

    @Subscribe
    @AllowConcurrentEvents
    public void onStatusUpdate(InternalStatus status) {

        Status tweet = status.getInternalStatus();
        //status.getInternalStatus().getRetweetCount();
        for (MediaEntity mediaEntity : tweet.getExtendedMediaEntities()) {
            //System.out.println("media!! "+mediaEntity.getType() + ": " + mediaEntity.getMediaURL()+ ": " + mediaEntity.getDisplayURL()+ ": " + mediaEntity.getExpandedURL());
            tweetDataLogic.incrMediaCounter(mediaEntity);
            tweetDataLogic.setMediaUrl(mediaEntity.getMediaURLHttps());
        }
        String language = tweet.getLang();
        if (language!=null || !language.isEmpty()) {
            tweetDataLogic.incrLaguageCounter(language);
        }
        boolean isRetweet = tweet.isRetweet();
        if(isRetweet || tweet.getText().contains("RT")) {
            tweetDataLogic.incrTotalRetweets();
            if (isRetweet) {
                long retweetedStatusId = tweet.getRetweetedStatus().getId();
                long retweetCreatedAt = tweet.getRetweetedStatus().getCreatedAt().getTime();
                tweetDataLogic.incrTweetScore(retweetedStatusId, retweetCreatedAt);
            }
        } else {
            tweetDataLogic.incrOriginalTweets();
        }
        tweetDataLogic.setCreatedDate(tweet.getId(), tweet.getCreatedAt().getTime());
        tweetDataLogic.setNewTweetMeta(status);
        Place place = tweet.getPlace();
        if (place != null) {
            tweetDataLogic.incrCountryCounter(place.getCountryCode());
        } else {
            //count tweets without country specified?
        }
        activePeopleAnalyzer.TweetArrived(tweet);
        tweetsOverTimeAnalyzer.TweetArrived(status);

        if (tweet.isPossiblySensitive()) return;

        String text = tweet.getText();

        String originalSource = tweet.getSource();
        String source = originalSource.substring(originalSource.indexOf(">" + 1), originalSource.lastIndexOf("<"));

        if (source != null || !source.isEmpty()) {
            tweetDataLogic.incrSourceCounter(source);
        }

        Pattern patternForWords = Pattern.compile("\\w+");
        text = text.replaceAll("((https?|ftp|file):\\/\\/[-a-zA-Z0-9+&@#\\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\\/%=~_|])", "");
        Pattern pattern = Pattern.compile("(\\b(?<!#|http)\\w+)");
//         pattern.toString();
        Matcher matcher = patternForWords.matcher(text);
        while (matcher.find()) {
            String word = matcher.group().toLowerCase();
            if (Misc.isBadWord(word)) return;
            if (Misc.isCommon(word)) return;
            tweetDataLogic.incrWordCounter(word);
//            if ( word.startsWith("#") ) {
//                LoggerFactory.getLogger(this.getClass()).debug("got hashtag: "+ word);
//                tweetDataLogic.incrHashtagCounter(language);
//            }
//            else {
//                process it as word in word cloud
//            }
        }

        HashtagEntity[] hashtagEntities = tweet.getHashtagEntities();
        for ( HashtagEntity entity : hashtagEntities ) {
            String hashtag = entity.getText();
            tweetDataLogic.incrHashtagCounter(hashtag);
        }

        if (retweetEnabled) {
            checkModeratedAndThen(status, tweet);
        } else {
            if (tweet.isRetweet() || tweet.getText().contains("RT")) {
                //tweetDataLogic.setNewTweetMeta(status);
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
            //tweetDataLogic.setNewTweetMeta(status); MOVED TO onStatusUpdate
            if (isBlockedUserTweet(tweet) || isBadKeywordTweet(tweet)) {
//                tweetDataLogic.setNewTweetMeta(status);  MOVED UP
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
            if (ConfigurationSingleton.getInstance().isV2()) {
                tweetDataLogic.addToCache(status);
            }
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

    public void updateStats(Status status) {
        tweetsOverTimeAnalyzer.tweetArrived(status);
    }
}
