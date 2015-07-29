package org.gistic.tweetboard.security;

/**
 * Created by osama-hussain on 5/27/15.
 */
public class TwitterCredentials {
    private final String accessToken;

    public TwitterCredentials(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }
}
