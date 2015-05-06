package org.gistic.tweetboard.eventmanager.twitter;

import com.google.common.eventbus.AsyncEventBus;
import org.gistic.tweetboard.TwitterConfiguration;
import twitter4j.*;
import twitter4j.auth.AccessToken;

import java.util.*;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Created by sohussain on 4/12/15.
 *
 */
public class TwitterService {
    private final TwitterConfiguration config;
    private final TwitterStreamFactory streamFactory;
    private TwitterStream sampleStream;
    public Map<String, EventServiceDetails> eventDetailsMap;

    public TwitterService(TwitterConfiguration config, TwitterStreamFactory streamFactory) {
        this.config = checkNotNull(config);
        this.streamFactory = streamFactory;
        eventDetailsMap = new HashMap<>();
    }

    public void start(AsyncEventBus bus, String uuid, String[] hashTags) throws Exception {
        sampleStream = streamFactory.getInstance();
        sampleStream.setOAuthConsumer(config.getConsumerKey(), config.getConsumerSecret());
        sampleStream.setOAuthAccessToken(new AccessToken(config.getUserKey(), config.getUserSecret()));
        TweetListener tweetListener = new TweetListener(bus, hashTags);
        eventDetailsMap.put(uuid, new EventServiceDetails(tweetListener, bus, hashTags));
        FilterQuery fq = new FilterQuery();
        fq.track(hashTags);
        sampleStream.addListener(tweetListener);
        sampleStream.filter(fq);
    }

    public void addNewEvent(AsyncEventBus bus, String uuid, String[] hashTags) {
        FilterQuery fq = new FilterQuery();
        sampleStream.clearListeners();
        sampleStream.shutdown();
        sampleStream = streamFactory.getInstance();
        sampleStream.setOAuthConsumer(config.getConsumerKey(), config.getConsumerSecret());
        sampleStream.setOAuthAccessToken(new AccessToken(config.getUserKey(), config.getUserSecret()));
        TweetListener tweetListener = new TweetListener(bus, hashTags);
        eventDetailsMap.put(uuid, new EventServiceDetails(tweetListener, bus, hashTags));
        List<TweetListener> listeners = new ArrayList<>();
        List<String> hashtagsList = new ArrayList<>();
        for (Map.Entry<String, EventServiceDetails> entry: eventDetailsMap.entrySet()) {
            EventServiceDetails details = entry.getValue();
            listeners.add(details.getListener());
            Collections.addAll(hashtagsList, details.getHashtags());
        }
        String[] hashtags = new String[hashtagsList.size()];
        fq.track( hashtagsList.toArray(hashtags) );
        listeners.forEach((streamListener) -> sampleStream.addListener(streamListener));
        sampleStream.filter(fq);


    }

    public boolean stop(String uuid) throws Exception {
        EventServiceDetails eventDetails = eventDetailsMap.remove(uuid);
        checkNotNull(eventDetails);
        sampleStream.removeListener(eventDetails.getListener());
        if (eventDetailsMap.size() == 0) {
            sampleStream.clearListeners();
            sampleStream.shutdown();
            sampleStream = null;
            return true;
        } else return false;
    }

}
