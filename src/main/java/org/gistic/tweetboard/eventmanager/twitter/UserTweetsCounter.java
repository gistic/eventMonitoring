package org.gistic.tweetboard.eventmanager.twitter;

import org.json.JSONException;
import org.json.JSONObject;

public class UserTweetsCounter implements Comparable<UserTweetsCounter> {
    public String name;
    public String screenName;
    public String profileBackgroundImageURL;
    public String profileImageURL;
    public int tweetsCount = 0;

    public UserTweetsCounter(String name, String screenName, String profileBackgroundImageURL,
                             String profileImageURL) {
        super();
        this.name = name;
        this.screenName = screenName;
        this.profileBackgroundImageURL = profileBackgroundImageURL;
        this.profileImageURL = profileImageURL;
    }

    public void increaseTweets() {
        tweetsCount++;
    }

    public JSONObject getJsonObject(){
        JSONObject object = new JSONObject();
        try {
            object.put("name", name);
            object.put("screen_name", screenName);
            object.put("profile_background_image_url", profileBackgroundImageURL);
            object.put("profile_image_url", profileImageURL);
            object.put("tweets_count", tweetsCount);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return object;
    }

    public int compareTo(UserTweetsCounter o) {
        return -1 * ((Integer) tweetsCount).compareTo((Integer) o.tweetsCount);
    }
}
