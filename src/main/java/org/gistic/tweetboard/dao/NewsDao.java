package org.gistic.tweetboard.dao;

import java.security.MessageDigest;

import java.security.NoSuchAlgorithmException;
import java.util.List;

import org.gistic.tweetboard.JedisPoolContainer;
import org.gistic.tweetboard.representations.GenericArray;
import org.json.JSONObject;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.exceptions.JedisException;

import org.gistic.tweetboard.Util.Misc;

public class NewsDao {
	
	public void saveNewsToRedis(String uuid, JSONObject newsJson){
		
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
        	
        	jedis.hset(uuid+":news", Misc.MD5Encode(newsJson.getString("url")), newsJson.toString());
        	
        }catch(JedisException e){
        	e.printStackTrace();
        }
	}
	
	public GenericArray<String> getSavedNewsFromRedis(String uuid){
		List<String> results = null;
		
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
        	
			results = jedis.hvals(uuid+":news");
        	
        }catch(JedisException e){
        	e.printStackTrace();
        }
		
		return new GenericArray<String>(results.toArray(new String[]{}));
	}

}
