package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.eventmanager.Message;

/**
 * Created by osama-hussain on 6/10/15.
 */
public class LiveTweetsBroadcasterSingleton {
    private static  LiveTweetsBroadcaster broadcaster;
    public static void set(LiveTweetsBroadcaster liveTweetsBroadcaster) {
        broadcaster = liveTweetsBroadcaster;
    }

    public static void broadcast(Message msg) {
        broadcaster.broadcastMessage(msg);
    }
}
