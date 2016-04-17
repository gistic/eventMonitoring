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


	public void incrSourceCounter(String uuid, String url) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			jedis.zincrby(uuid+":facebook:stats:source", 1, url);
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


	public void setPageDetails(String uuid, String pageUrl, JSONObject obj) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			jedis.hset(uuid + ":fbPageDetails:" + pageUrl, "page_likes", Long.toString(obj.getLong("page_likes")));
			jedis.hset(uuid + ":fbPageDetails:" + pageUrl, "talking_about", Long.toString(obj.getLong("talking_about")));
			jedis.hset(uuid + ":fbPageDetails:" + pageUrl, "image_url", obj.getString("image_url"));
			jedis.hset(uuid + ":fbPageDetails:" + pageUrl, "source", obj.getString("source"));
			//jedis.hset(uuid + ":fbPageDetails:" + pageUrl, "page_url", pageUrl);
		} catch (JedisException jE) {
			jE.printStackTrace();
		}
	}

	public void incrPageScore(String uuid, String pageUrl, long score) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			jedis.zincrby(uuid+":facebook:stats:pageScore", score, pageUrl);
		}catch(JedisException e){
			e.printStackTrace();
		}
	}

	public void incrPageSharedCount(String uuid, String pageUrl, long score) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			jedis.zincrby(uuid+":facebook:stats:shares", score, pageUrl);
		}catch(JedisException e){
			e.printStackTrace();
		}
	}

	public void incrPageCommentCount(String uuid, String pageUrl, long score) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			jedis.zincrby(uuid+":facebook:stats:comments", score, pageUrl);
		}catch(JedisException e){
			e.printStackTrace();
		}
	}

	public void incrPageLikes(String uuid, String pageUrl, long score) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			jedis.zincrby(uuid+":facebook:stats:likes", score, pageUrl);
		}catch(JedisException e){
			e.printStackTrace();
		}
	}

	public Set<Tuple> getTopNPages(String uuid, int count) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			return jedis.zrevrangeByScoreWithScores(uuid+":facebook:stats:pageScore", "+inf", "-inf", 0, count);
		} catch (JedisException jE) {
			jE.printStackTrace();
		}
		//TODO: error module
		return null;
	}

	public Set<Tuple> getTopNPagesByShares(String uuid, int count) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			return jedis.zrevrangeByScoreWithScores(uuid+":facebook:stats:shares", "+inf", "-inf", 0, count);
		} catch (JedisException jE) {
			jE.printStackTrace();
		}
		//TODO: error module
		return null;
	}
	public Set<Tuple> getTopNPagesByComments(String uuid, int count) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			return jedis.zrevrangeByScoreWithScores(uuid+":facebook:stats:comments", "+inf", "-inf", 0, count);
		} catch (JedisException jE) {
			jE.printStackTrace();
		}
		//TODO: error module
		return null;
	}
	public Set<Tuple> getTopNPagesByLikes(String uuid, int count) {
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			return jedis.zrevrangeByScoreWithScores(uuid+":facebook:stats:likes", "+inf", "-inf", 0, count);
		} catch (JedisException jE) {
			jE.printStackTrace();
		}
		//TODO: error module
		return null;
	}

	public String getPageDetails(String uuid, String pageUrl) {
		JSONObject pageDetails = new JSONObject();
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			String pageLikes = jedis.hget(uuid + ":fbPageDetails:" + pageUrl, "page_likes");
			String talkingAbout = jedis.hget(uuid + ":fbPageDetails:" + pageUrl, "talking_about");
			String imageUrl = jedis.hget(uuid + ":fbPageDetails:" + pageUrl, "image_url");
			String pageName = jedis.hget(uuid + ":fbPageDetails:" + pageUrl, "source");
			//String pageUrl = jedis.hget(uuid + ":fbPageDetails:" + pageUrl, "page_url");
			pageDetails.put("page_likes", pageLikes);
			pageDetails.put("talking_about", talkingAbout);
			pageDetails.put("image_url", imageUrl);
			pageDetails.put("source", pageName);
			pageDetails.put("page_url", pageUrl);
			return pageDetails.toString();
		} catch (JedisException jE) {
			jE.printStackTrace();
		}
		//TODO: error module
		return null;
	}
}
