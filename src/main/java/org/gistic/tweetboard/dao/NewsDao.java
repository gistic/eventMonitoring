package org.gistic.tweetboard.dao;

import java.security.MessageDigest;

import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Set;

import org.gistic.tweetboard.JedisPoolContainer;
import org.gistic.tweetboard.representations.GenericArray;
import org.json.JSONObject;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.Tuple;
import redis.clients.jedis.exceptions.JedisException;

import org.gistic.tweetboard.util.Misc;

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

	public void incrCountryCounter(String uuid, String country) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			jedis.zincrby(uuid+":news:stats:country", 1, country);
		}catch(JedisException e){
			e.printStackTrace();
		}
	}

	public void incrSourceCounter(String uuid, String source) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			jedis.zincrby(uuid+":news:stats:source", 1, source);
		}catch(JedisException e){
			e.printStackTrace();
		}
	}

	public Set<Tuple> getTopNSources(String uuid, Integer count) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			return jedis.zrevrangeByScoreWithScores(uuid+":news:stats:source", "+inf", "-inf", 0, count);
		} catch (JedisException jE) {
			jE.printStackTrace();
		}
		//TODO: error module
		return null;
	}

	public Set<Tuple> getTopNCountries(String uuid, Integer count) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			return jedis.zrevrangeByScoreWithScores(uuid+":news:stats:country", "+inf", "-inf", 0, count);
		} catch (JedisException jE) {
			jE.printStackTrace();
		}
		//TODO: error module
		return null;
	}

}
