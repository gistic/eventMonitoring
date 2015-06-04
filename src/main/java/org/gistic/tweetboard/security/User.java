package org.gistic.tweetboard.security;

/**
 * Created by osama-hussain on 5/27/15.
 */
public class User {

    public User() {
    }
    public User(boolean noUser) {
        this.noUser = noUser;
    }

    String accessToken;

    public String getAccessToken() {
        return accessToken;
    }

    public User(String accessToken) {
        this.accessToken = accessToken;
    }

    boolean noUser = false;
    public boolean isNoUser() {
        return noUser;
    }
}
