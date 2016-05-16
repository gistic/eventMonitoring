package org.gistic.tweetboard.security;

/**
 * Created by osama-hussain on 5/27/15.
 */
public class TwitterCredentials {
    private final String accessToken;
    private final boolean eventyzerFlag;

    public TwitterCredentials(String accessToken) {
        this.eventyzerFlag = false;
        this.accessToken = accessToken;
    }

    public TwitterCredentials(String accessToken, boolean eventyzerFlag) {
        this.accessToken = accessToken;
        this.eventyzerFlag = eventyzerFlag;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public boolean getEventyzerFlag() {
        return eventyzerFlag;
    }
}
