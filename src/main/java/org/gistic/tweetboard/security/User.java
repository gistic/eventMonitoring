package org.gistic.tweetboard.security;

/**
 * Created by osama-hussain on 5/27/15.
 */
public class User {

    public String getAccessTokenSecret() {
        return accessTokenSecret;
    }

    private String accessTokenSecret;

    public User() {
    }
    public User(boolean noUser) {
        this.noUser = noUser;
    }

    String accessToken;

    public String getAccessToken() {
        return accessToken;
    }

    public User(String accessToken, String accessTokenSecret) {
        this.accessToken = accessToken;
        this.accessTokenSecret = accessTokenSecret;
    }

    boolean noUser = false;
    public boolean isNoUser() {
        return noUser;
    }
}
