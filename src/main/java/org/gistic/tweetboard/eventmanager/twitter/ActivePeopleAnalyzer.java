package org.gistic.tweetboard.eventmanager.twitter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import twitter4j.Status;

public class ActivePeopleAnalyzer {
    public HashMap<Long, UserTweetsCounter> map = new HashMap<Long, UserTweetsCounter>();

    public void TweetArrived(Status tweet) {
        if (map.containsKey(tweet.getUser().getId()))
            map.get(tweet.getUser().getId()).increaseTweets();
        else {
            long id = tweet.getUser().getId();
            UserTweetsCounter counter = new UserTweetsCounter(tweet.getUser().getName(), tweet.getUser().getScreenName(),
                    tweet.getUser().getProfileBackgroundImageURL(), tweet.getUser().getProfileImageURL());
            counter.increaseTweets();
            map.put(id, counter);
        }
    }

    public List<UserTweetsCounter> getTopActive(int max) {
        List<UserTweetsCounter> all = new ArrayList<UserTweetsCounter>(map.values());
        java.util.Collections.sort(all);
        List<UserTweetsCounter> result = new ArrayList<UserTweetsCounter>();
        for (int i = 0; i < max && i < all.size(); i++)
            result.add(all.get(i));

        return result;
    }
}
