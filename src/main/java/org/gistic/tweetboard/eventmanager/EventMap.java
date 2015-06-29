package org.gistic.tweetboard.eventmanager;

import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.datalogic.TweetDataLogic;
import org.gistic.tweetboard.eventmanager.twitter.LiveStreamMetadataThread;
import org.gistic.tweetboard.eventmanager.twitter.TwitterServiceManagerV2;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.logging.Logger;

/**
 * Created by sohussain on 4/7/15.
 */
public class EventMap {
    private static Map<String, Event> allEvents = new HashMap<>();
    private static Map<String, List<Event>> userEvents = new HashMap<>();
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
        List<Event> events = userEvents.get(accessToken);
        Event event;
        if (events == null) {
            events = new ArrayList<Event>();
            userEvents.put(accessToken, events);
        }
        if (events.size() >= 3 ) {
            event = events.remove(0);
            event.delete(accessToken);
            allEvents.remove(event.getUuid());
        }
        //events.
//        for (Event event: events) {
//            if (event != null) {
//                event.delete(accessToken);
//                allEvents.remove(event.getUuid());
//            }
//        }
        event =  new Event(uuid, hashTags, tweetDataLogic, true, accessToken, twitterServiceManagerV2, accessToken);
        allEvents.put(uuid, event);
        userEvents.get(accessToken).add(event);
        ExecutorSingleton.getInstance().submit(new LiveStreamMetadataThread(event));
    }

    public static Event get(String uuid) {
        return allEvents.get(uuid);
    }

    public static void delete(String uuid, String authToken) {
        Event e = allEvents.get(uuid);
        allEvents.remove(uuid);
        if (userEvents.containsValue(authToken)) {
//            userEvents.get(authToken).remove(authToken);
            List<Event> events = userEvents.get(authToken);
            for (Event ev : events) {
                if(ev.getUuid().equals(uuid)) {
                    boolean removed = events.remove(ev);
                    if (removed) LoggerFactory.getLogger(EventMap.class).debug("User event was removed from userEvents map");
                }
            }
        }
        e.delete(authToken);
    }

    public static void delete(String uuid) {
        delete(uuid, null);
    }
}
