package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.eventmanager.Message;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by osama-hussain on 6/10/15.
 */
public class LiveTweetsBroadcasterSingleton {
    private static  LiveTweetsBroadcaster broadcaster;
    public static void set(LiveTweetsBroadcaster liveTweetsBroadcaster) {
        broadcaster = liveTweetsBroadcaster;
    }

    public static void broadcast(Message msg) {
        if(msg.getType().equals(Message.Type.LiveTweet)) {
            String jsonString = msg.getMsg();
            JSONObject json = new JSONObject(jsonString);
            long id = json.getLong("id");
            String idAsString = String.valueOf(id);
            json.put("id_str", idAsString);
            msg.setMsg(json.toString());
        }
        broadcaster.broadcastMessage(msg);

    }
}
