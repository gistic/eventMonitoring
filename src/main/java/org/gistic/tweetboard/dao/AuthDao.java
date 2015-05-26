package org.gistic.tweetboard.dao;

/**
 * Created by osama-hussain on 5/26/15.
 */
public interface AuthDao {
    void setRequestToken(String requestToken, String requestTokenSecret);

    String getRequestToken(String oauthToken);

    void setAccessTokenSecret(String accessToken, String accessTokenSecret);

    String getAccessTokenSecret(String accessToken);

    String getUserId(String accessToken);

    void setUserId(String accessToken, String userIdFromTwitter);
}
