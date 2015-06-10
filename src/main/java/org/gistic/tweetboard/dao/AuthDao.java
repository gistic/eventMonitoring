package org.gistic.tweetboard.dao;

import org.gistic.tweetboard.security.User;
import twitter4j.TwitterException;

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

    void setTempHashtags(String token, String hashtags);

    String getTempHashtags(String oauthToken);

    void deleteRequestToken(String oauthToken);

    void deleteTempHashTags(String oauthToken);

    twitter4j.User getOrUpdateUserDetailsInCache(User user) throws TwitterException;
}
