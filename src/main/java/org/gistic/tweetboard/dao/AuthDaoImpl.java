package org.gistic.tweetboard.dao;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.gistic.tweetboard.JedisPoolContainer;
import org.gistic.tweetboard.util.Misc;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.exceptions.JedisException;
import twitter4j.TwitterException;
import twitter4j.TwitterObjectFactory;
import twitter4j.User;

/**
 * Created by osama-hussain on 5/26/15.
 */
public class AuthDaoImpl implements AuthDao {

    private static final String TWITTER_REQUEST_TOKEN_KEY_STUB = "twitterRequestTokenKey:";
    private static final String TWITTER_ACCESS_TOKEN_KEY_STUB = "twitterAccessTokenKey:";
    private static final String TWITTER_USER_ID_KEY_STUB = "twitterUserIdKey:";
    public static final String REDIRECT_TO_HOME = "redirectToHome";

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

    @Override
    public void setTempHashtags(String token, String hashtags) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            jedis.set("hashtags:"+token, hashtags);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public String getTempHashtags(String oauthToken) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            return jedis.get("hashtags:"+oauthToken);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    @Override
    public void deleteRequestToken(String oauthToken) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            jedis.del(getTwitterRequestTokenKey(oauthToken));
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public void deleteTempHashTags(String oauthToken) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            jedis.del("hashtags:"+oauthToken);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public String getOrUpdateUserDetailsInCache(org.gistic.tweetboard.security.User user) throws TwitterException {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            String userDetailsString = null;
            User twitterUser = null;
            userDetailsString =jedis.get(getTwitterUserDetails(user.getAccessToken(), user.getAccessTokenSecret()));
            if (userDetailsString==null || userDetailsString.isEmpty()) {
                twitterUser = Misc.getTwitter(user).verifyCredentials();
//                userDetailsString = TwitterObjectFactory.getRawJSON(twitterUser);
                try {
                    userDetailsString = new ObjectMapper().writeValueAsString(twitterUser);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                    return null;
                }
                System.out.println("userDetailsString is: "+ userDetailsString);
                String accessToken = user.getAccessToken();
                String accessTokenSecret = user.getAccessTokenSecret();
                jedis.set(getTwitterUserDetails(accessToken, accessTokenSecret), userDetailsString);
                jedis.expire(getTwitterUserDetails(accessToken, accessTokenSecret), 90);
//                return user;
            } else {
                //return TwitterObjectFactory.createUser(userDetailsString);
            }
            return userDetailsString;
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        return null;
    }

    @Override
    public void setRedirectToHomeFlag(String token, String redirectToHome) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            jedis.set(REDIRECT_TO_HOME +":"+token, redirectToHome);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
    }

    @Override
    public String getRedirectToHomeFlag(String oauthToken) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            return jedis.get(REDIRECT_TO_HOME+":"+oauthToken);
        } catch (JedisException jE) {
            jE.printStackTrace();
        }
        return "false";
    }

    @Override
    public void deleteRedirectToHomeFlag(String oauthToken) {
        try (Jedis jedis = JedisPoolContainer.getInstance()){
            jedis.del(REDIRECT_TO_HOME+":"+oauthToken);
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

    private String getTwitterUserDetails(String accessToken, String accessTokenSecret) {
        return accessToken+":"+accessTokenSecret+":userDetails";
    }
}

