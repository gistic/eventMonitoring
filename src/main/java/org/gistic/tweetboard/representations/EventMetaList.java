package org.gistic.tweetboard.representations;

/**
 * Created by osama-hussain on 4/29/15.
 */
public class EventMetaList {
    private EventMeta[] data;
    private String[] trendingHashtags;

    public EventMetaList(EventMeta[] data) {
        this.data = data;
    }

    public EventMeta[] getData() {

        return data;
    }

    public void setData(EventMeta[] data) {
        this.data = data;
    }

    public void setTrendingHashtags(String[] trendingHashtags) {
        this.trendingHashtags = trendingHashtags;
    }

    public String[] getTrendingHashtags() {
        return trendingHashtags;
    }
}
