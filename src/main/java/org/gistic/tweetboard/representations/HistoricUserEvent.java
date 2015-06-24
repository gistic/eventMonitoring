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

    public String getProfileImgUrl() {
        return profileImgUrl;
    }

    public String getNoOfTweets() {
        return noOfTweets;
    }

    public String getNoOfRetweets() {
        return noOfRetweets;
    }

    private final String screenName;
    private final String profileImgUrl;
    private final String noOfTweets;
    private final String noOfRetweets;
    private String mediaUrl;

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public HistoricUserEvent(String hashtags, String startTime, String screenName, String profileImgUrl, String noOfTweets, String noOfRetweets, String mediaUrl) {
        this.hashtags = hashtags;
        this.startTime = startTime;
        this.screenName = screenName;
        this.profileImgUrl = profileImgUrl;
        this.noOfTweets = noOfTweets;
        this.noOfRetweets = noOfRetweets;
        this.mediaUrl = mediaUrl;
    }
}
