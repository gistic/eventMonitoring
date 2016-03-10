package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.JedisPoolContainer;
import org.gistic.tweetboard.Util.Misc;
import org.gistic.tweetboard.dao.NewsDao;
import org.gistic.tweetboard.eventmanager.Message;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import javax.ws.rs.core.MediaType;

import org.json.JSONObject;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.exceptions.JedisException;

@Path("/liveNews")
public class LiveNewsBroadcaster {
	

	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public void pushNews(String newsItem){
		JSONObject obj = new JSONObject(newsItem);
		
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			
        	if(jedis.hget(obj.getString("uuid")+":news", Misc.MD5Encode(obj.getString("url"))) == null ){
        		
        		Message msg = new Message(obj.getString("uuid"), Message.Type.NewsItem, obj.toString());
        		NewsDao newsDao = new NewsDao();
        		newsDao.saveNewsToRedis(obj.getString("uuid"), obj);
        		LiveTweetsBroadcasterSingleton.broadcast(msg);
        	}
        	
        }catch(JedisException e){
        	e.printStackTrace();
        }
		
		
    }
}