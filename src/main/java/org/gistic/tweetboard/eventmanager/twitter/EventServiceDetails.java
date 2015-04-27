package org.gistic.tweetboard.eventmanager.twitter;

import com.google.common.eventbus.AsyncEventBus;

/**
 * Created by Osama-GIS on 4/22/2015.
 */
public class EventServiceDetails {
    TweetListener listener;
    AsyncEventBus bus;

    public TweetListener getListener() {
        return listener;
    }

    public void setListener(TweetListener listener) {
        this.listener = listener;
    }

    public AsyncEventBus getBus() {
        return bus;
    }

    public void setBus(AsyncEventBus bus) {
        this.bus = bus;
    }

    public String[] getHashtags() {
        return hashtags;
    }

    public void setHashtags(String[] hashtags) {
        this.hashtags = hashtags;
    }

    String[] hashtags;

    public EventServiceDetails(TweetListener listener, AsyncEventBus bus, String[] hashtags) {
        this.listener = listener;
        this.bus = bus;
        this.hashtags = hashtags;
    }
}
