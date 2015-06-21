package org.gistic.tweetboard.representations;

/**
 * Created by osama-hussain on 4/29/15.
 */
public class EventMetaList {
    private BasicStats[] basicStats;
    private EventMeta[] data;
    private String[] trendingHashtags;

    public EventMetaList(BasicStats[] data, EventMeta[] metaArray) {
        this.basicStats = data;
        this.data = metaArray;
    }

    public BasicStats[] getBasicStats() {

        return basicStats;
    }

    public void setBasicStats(BasicStats[] data) {
        this.basicStats = data;
    }

    public void setTrendingHashtags(String[] trendingHashtags) {
        this.trendingHashtags = trendingHashtags;
    }

    public String[] getTrendingHashtags() {
        return trendingHashtags;
    }

    public EventMeta[] getData() {
        return data;
    }

    public void setData(EventMeta[] metaArray) {
        this.data = metaArray;
    }
}
