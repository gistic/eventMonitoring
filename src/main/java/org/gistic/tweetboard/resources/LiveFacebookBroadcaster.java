package org.gistic.tweetboard.resources;

import javax.sound.midi.Synthesizer;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;

import org.gistic.tweetboard.JedisPoolContainer;
import org.gistic.tweetboard.datalogic.FacebookDataLogic;
import org.gistic.tweetboard.util.Misc;
import org.gistic.tweetboard.dao.FacebookDao;
import org.gistic.tweetboard.dao.NewsDao;
import org.gistic.tweetboard.eventmanager.Message;
import org.json.JSONObject;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.exceptions.JedisException;

@Path("liveFacebook")
public class LiveFacebookBroadcaster {

	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public void pushFbPosts(String FbPost){
		JSONObject obj = new JSONObject(FbPost);
		
		try (Jedis jedis = JedisPoolContainer.getInstance()) {
			String uuid = obj.getString("uuid");
        	if(jedis.hget(uuid+":fb", Misc.MD5Encode(obj.getString("url"))) == null ){
        		
        		Message msg = new Message(uuid, Message.Type.FbPost, obj.toString());
        		FacebookDao facebookDao = new FacebookDao();
        		facebookDao.saveNewsToRedis(uuid, obj);

				facebookDao.incrSourceCounter(uuid, obj.getString("source"));
				FacebookDataLogic fbDataLogic = new FacebookDataLogic(uuid);
				fbDataLogic.incrementPageScore(obj);
        		LiveTweetsBroadcasterSingleton.broadcast(msg);
        	}
        	
        }catch(JedisException e){
        	e.printStackTrace();
        }
		
		
    }
}
