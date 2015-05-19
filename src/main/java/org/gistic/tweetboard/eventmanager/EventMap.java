package org.gistic.tweetboard.eventmanager;

import com.bendb.dropwizard.redis.JedisFactory;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.datalogic.TweetDataLogic;
import org.gistic.tweetboard.eventmanager.twitter.LiveStreamMetadataThread;
import redis.clients.jedis.Jedis;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Created by sohussain on 4/7/15.
 */
public class EventMap {
    private static Map<String, Event> allEvents = new HashMap<>();
    private static TwitterConfiguration twitterConfiguration= null;
    private EventMap(){
    }
    public static void setTwitterConfiguration(TwitterConfiguration tC) {
        twitterConfiguration = tC;
    }
    public static void put(String[] hashTags, TweetDataLogic tweetDataLogic, String uuid) {
        Event event = new Event(uuid, hashTags, tweetDataLogic);
        allEvents.put(uuid, event);
        ExecutorSingleton.getInstance().submit(new LiveStreamMetadataThread(event));
    }

    public static Event get(String uuid) {
        return allEvents.get(uuid);
    }

    public static void delete(String uuid) {
        Event e = allEvents.get(uuid);
        allEvents.remove(uuid);
        e.delete();
    }
}
