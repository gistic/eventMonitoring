package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.dao.NewsDao;
import org.gistic.tweetboard.eventmanager.Message;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import javax.ws.rs.core.MediaType;

import org.json.JSONObject;

@Path("/liveNews")
public class LiveNewsBroadcaster {
	

	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public void printArticle(String newsItem){
		JSONObject obj = new JSONObject(newsItem);
		System.out.println(obj.get("uuid"));
	
		Message msg = new Message(obj.getString("uuid"), Message.Type.NewsItem, obj.toString());
		NewsDao newsDao = new NewsDao();
		newsDao.saveNewsToRedis(obj.getString("uuid"), obj);
		LiveTweetsBroadcasterSingleton.broadcast(msg);
		
		
		
    }
}