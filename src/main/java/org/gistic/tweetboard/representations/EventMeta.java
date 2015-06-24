package org.gistic.tweetboard.representations;

/**
 * Created by osama-hussain on 4/29/15.
 */
public class EventMeta {
    private String uuid;
    private String startTime;
    private String hashTags;
    private String mediaUrl;
    private String accessToken;
    private String screenName;
    private String prfoileImageUrl;

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getHashTags() {
        return hashTags;
    }

    public void setHashTags(String hashTags) {
        this.hashTags = hashTags;
    }

    public EventMeta(String uuid, String startTime, String hashTags, String mediaUrl, String accessToken) {
        this.uuid = uuid;
        this.startTime = startTime;
        this.hashTags = hashTags;
        this.mediaUrl = mediaUrl;
        this.accessToken = accessToken;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public void setScreenName(String screenName) {
        this.screenName = screenName;
    }

    public String getScreenName() {
        return screenName;
    }

    public void setPrfoileImageUrl(String prfoileImageUrl) {
        this.prfoileImageUrl = prfoileImageUrl;
    }

    public String getPrfoileImageUrl() {
        return prfoileImageUrl;
    }
}
