package org.gistic.tweetboard.dao;

import java.util.List;
import java.util.Set;

import org.gistic.tweetboard.JedisPoolContainer;
import org.gistic.tweetboard.util.Misc;
import org.gistic.tweetboard.representations.GenericArray;
import org.json.JSONObject;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.Tuple;
import redis.clients.jedis.exceptions.JedisException;

public class FacebookDao {

	public void saveNewsToRedis(String uuid, JSONObject newsJson){
		
        try (Jedis jedis = JedisPoolContainer.getInstance()) {
        	
        	jedis.hset(uuid+":fb", Misc.MD5Encode(newsJson.getString("url")), newsJson.toString());
        	
        }catch(JedisException e){
        	e.printStackTrace();
        }
	}
	
	public GenericArray<String> getSavedNewsFromRedis(String uuid){
		List<String> results = null;
		
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
        	
			results = jedis.hvals(uuid+":fb");
        	
        }catch(JedisException e){
        	e.printStackTrace();
        }
		
		return new GenericArray<String>(results.toArray(new String[]{}));
	}


	public void incrSourceCounter(String uuid, String source) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			jedis.zincrby(uuid+":facebook:stats:source", 1, source);
		}catch(JedisException e){
			e.printStackTrace();
		}
	}

	public Set<Tuple> getTopNSources(String uuid, Integer count) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			return jedis.zrevrangeByScoreWithScores(uuid+":facebook:stats:source", "+inf", "-inf", 0, count);
		} catch (JedisException jE) {
			jE.printStackTrace();
		}
		//TODO: error module
		return null;
	}


}
