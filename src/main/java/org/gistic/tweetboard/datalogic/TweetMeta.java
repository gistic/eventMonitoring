package org.gistic.tweetboard.datalogic;

/**
 * Created by osama-hussain on 5/20/15.
 */
public class TweetMeta {
    private long creationDate;
    private long retweetsCount;

    public long getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(long creationDate) {
        this.creationDate = creationDate;
    }

    public long getRetweetsCount() {
        return retweetsCount;
    }

    public void setRetweetsCount(long retweetsCount) {
        this.retweetsCount = retweetsCount;
    }

    public TweetMeta(long creationDate, long retweetsCount) {
        this.creationDate = creationDate;
        this.retweetsCount = retweetsCount;
    }
}
