package org.gistic.tweetboard.eventmanager.twitter;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;
import twitter4j.Status;

public class TweetsOverTimeAnalyzer {
    Calendar start = Calendar.getInstance();
    Calendar tweetTime = Calendar.getInstance();
    ArrayList<Integer> tweetsCounterPerMinute = new ArrayList<Integer>();

    public TweetsOverTimeAnalyzer() {
        Date date = new Date();
        start.setTime(date);
        start.set(Calendar.SECOND, 0);
    }

    public void TweetArrived(InternalStatus status) {
        Status tweet = status.getInternalStatus();
        tweetArrived(tweet);
    }

    public void tweetArrived(Status tweet) {
        tweetTime.setTime(tweet.getCreatedAt());
        long diff = (tweetTime.getTimeInMillis() - start.getTimeInMillis()) / (60 * 1000);
        int diffInMinutes;

        if (diff < Integer.MIN_VALUE || diff > Integer.MAX_VALUE) {
            System.out.printf("Tweet is very old, tweet id: %s\n", tweet.getId());
            return;
        }

        diffInMinutes = (int) diff;
        if (diffInMinutes < 0)
            return;

        if (diffInMinutes >= tweetsCounterPerMinute.size()) {
            for (int i = tweetsCounterPerMinute.size(); i <= diffInMinutes; i++) {
                tweetsCounterPerMinute.add(0);
            }
        }
        tweetsCounterPerMinute.set(diffInMinutes, tweetsCounterPerMinute.get(diffInMinutes) + 1);
    }

    public class TweetsCountPerTime {
        public Date time;
        public int tweetsCount = 0;

        public TweetsCountPerTime(Date time, int tweetsCount) {
            this.time = time;
            this.tweetsCount = tweetsCount;
        }

        public JSONObject getJsonObject() {
            JSONObject object = new JSONObject();
            SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a");
            try {
                object.put("time", sdf.format(time));
                object.put("tweets_count", tweetsCount);
            } catch (JSONException e) {
                e.printStackTrace();
            }

            return object;
        }
    }

    public List<TweetsCountPerTime> getTweetsPerTime(int sampleRate, int period) {
        int startFrom;
        if (period == -1 || period > tweetsCounterPerMinute.size()) {
            startFrom = 0;
        } else {
            startFrom = tweetsCounterPerMinute.size() - period;
        }

        List<TweetsCountPerTime> result = new ArrayList<TweetsCountPerTime>();
        for (int i = startFrom; i < tweetsCounterPerMinute.size();) {
            int counter = 0;
            for (int j = 0; j < sampleRate && i < tweetsCounterPerMinute.size(); j++) {
                counter += tweetsCounterPerMinute.get(i);
                i++;
            }
            Calendar cal = Calendar.getInstance();
            cal.setTime(start.getTime());
            cal.add(Calendar.MINUTE, i);
            result.add(new TweetsCountPerTime(cal.getTime(), counter));
        }
        return result;
    }
}