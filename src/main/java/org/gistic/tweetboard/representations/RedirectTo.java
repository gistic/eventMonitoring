package org.gistic.tweetboard.representations;

/**
 * Created by osama-hussain on 5/25/15.
 */
public class RedirectTo {
    private String url;

    public RedirectTo(String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
