package org.gistic.tweetboard.eventmanager;

import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.datalogic.TweetDataLogic;
import org.gistic.tweetboard.eventmanager.twitter.LiveStreamMetadataThread;
import org.gistic.tweetboard.eventmanager.twitter.TwitterServiceManagerV2;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by sohussain on 4/7/15.
 */
public class EventMap {
    private static Map<String, Event> allEvents = new HashMap<>();
    private static Map<String, Event> userEvents = new HashMap<>();
    private static TwitterConfiguration twitterConfiguration= null;
    private static TwitterServiceManagerV2 twitterServiceManagerV2;
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

    public static void putV2(String[] hashTags, TweetDataLogic tweetDataLogic, String uuid, String accessToken) {
        if (twitterServiceManagerV2 == null) twitterServiceManagerV2 = new TwitterServiceManagerV2(twitterConfiguration);
        Event event = userEvents.get(accessToken);
        if (event != null) {
            event.delete(accessToken);
            allEvents.remove(event.getUuid());
        }
        event =  new Event(uuid, hashTags, tweetDataLogic, true, accessToken, twitterServiceManagerV2, accessToken);
        allEvents.put(uuid, event);
        userEvents.put(accessToken, event);
        ExecutorSingleton.getInstance().submit(new LiveStreamMetadataThread(event));
    }

    public static Event get(String uuid) {
        return allEvents.get(uuid);
    }

    public static void delete(String uuid, String authToken) {
        Event e = allEvents.get(uuid);
        allEvents.remove(uuid);
        if (userEvents.containsValue(e)) {
            userEvents.remove(authToken);
        }
        e.delete(authToken);
    }

    public static void delete(String uuid) {
        delete(uuid, null);
    }
}
