package org.gistic.tweetboard.representations;

/**
 * Created by osama-hussain on 5/18/15.
 */
public class TopItem {
    private String code;
    private int count;

    public TopItem(String code, int count) {
        this.code = code;
        this.count = count;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
