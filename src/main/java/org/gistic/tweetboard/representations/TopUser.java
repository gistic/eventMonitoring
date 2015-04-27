package org.gistic.tweetboard.representations;

/**
 * Created by Osama-GIS on 4/21/2015.
 */
public class TopUser {
    private final int score;
    private String screenName;
    private String userId;

    public TopUser(String userId, String screenName, double score) {
        this.userId = userId;
        this.screenName = screenName;
        this.score = new Double(score).intValue();
    }

    public int getScore() {
        return score;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getScreenName() {
        return screenName;
    }

    public void setScreenName(String screenName) {
        this.screenName = screenName;
    }
}
