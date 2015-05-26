package org.gistic.tweetboard.dao;

import org.gistic.tweetboard.JedisPoolContainer;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.exceptions.JedisException;

/**
 * Created by osama-hussain on 5/26/15.
 */
public class AuthDaoImpl implements AuthDao {

    private static final String TWITTER_REQUEST_TOKEN_KEY_STUB = "twitterRequestTokenKey";
    private static final String TWITTER_ACCESS_TOKEN_KEY_STUB = "twitterAccessTokenKey";
    private static final String TWITTER_USER_ID_KEY_STUB = "twitterUserIdKey";

    @Override
    public void setRequestToken(String requestToken, String requestTokenSecret) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            jedis.set(getTwitterRequestTokenKey(requestToken), requestTokenSecret);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public String getRequestToken(String oauthToken) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            return jedis.get(getTwitterRequestTokenKey(oauthToken));
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    @Override
    public void setAccessTokenSecret(String accessToken, String accessTokenSecret) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            jedis.set(getTwitterAccessTokenKey(accessToken), accessTokenSecret);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public String getAccessTokenSecret(String accessToken) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            return jedis.get(getTwitterAccessTokenKey(accessToken));
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    @Override
    public String getUserId(String accessToken) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            return jedis.get(getTwitteruserIdKey(accessToken));
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    @Override
    public void setUserId(String accessToken, String userIdFromTwitter) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            jedis.set(getTwitteruserIdKey(accessToken), userIdFromTwitter);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    private String getTwitteruserIdKey(String accessToken) {
        return TWITTER_USER_ID_KEY_STUB+accessToken;
    }

    private String getTwitterAccessTokenKey(String accessToken) {
        return TWITTER_ACCESS_TOKEN_KEY_STUB+accessToken;
    }

    private String getTwitterRequestTokenKey(String requestToken) {
        return TWITTER_REQUEST_TOKEN_KEY_STUB+requestToken;
    }
}
