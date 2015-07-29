package org.gistic.tweetboard.representations;

/**
 * Created by osama-hussain on 6/24/15.
 */
public class HistoricUserEvent {
    private final String hashtags;
    private final String startTime;

    public String getHashtags() {
        return hashtags;
    }

    public String getStartTime() {
        return startTime;
    }

    public String getScreenName() {
        return screenName;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public String getNoOfTweets() {
        return noOfTweets;
    }

    public String getNoOfRetweets() {
        return noOfRetweets;
    }

    private final String screenName;
    private final String profileImageUrl;
    private final String noOfTweets;
    private final String noOfRetweets;
    private String mediaUrl;

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public HistoricUserEvent(String hashtags, String startTime, String screenName, String profileImageUrl, String noOfTweets, String noOfRetweets, String mediaUrl) {
        this.hashtags = hashtags;
        this.startTime = startTime;
        this.screenName = screenName;
        this.profileImageUrl = profileImageUrl;
        this.noOfTweets = noOfTweets;
        this.noOfRetweets = noOfRetweets;
        this.mediaUrl = mediaUrl;
    }
}
