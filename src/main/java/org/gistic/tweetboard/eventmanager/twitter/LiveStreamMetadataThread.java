package org.gistic.tweetboard.eventmanager.twitter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.gistic.tweetboard.DelayedJobsManager;
import org.gistic.tweetboard.datalogic.FacebookDataLogic;
import org.gistic.tweetboard.eventmanager.Event;
import org.gistic.tweetboard.eventmanager.Message;
import org.gistic.tweetboard.resources.EventsResource;
import org.gistic.tweetboard.resources.LiveTweetsBroadcasterSingleton;
import org.json.JSONArray;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import java.util.List;

/**
 * Created by osama-hussain on 5/19/15.
 */
public class LiveStreamMetadataThread implements Runnable {
    final int defaultSampleRate = 1;
    final int defaultPeriod = 25;
    final int defaultBroadcastIntervalInSecs = 10;
    private final EventsResource eventResource;

    Event event;

    public LiveStreamMetadataThread(Event event) {
        this.event = event;
        this.eventResource = new EventsResource();
    }

    @Override
    public void run() {
        //wait for twitter stream to establish
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        while(event.isRunning()) {
            List<TweetsOverTimeAnalyzer.TweetsCountPerTime> tweetsPerTime = event.getTweetsPerTime(defaultSampleRate, defaultPeriod);
            JSONArray result = new JSONArray();
            for (TweetsOverTimeAnalyzer.TweetsCountPerTime TweetsPeriod : tweetsPerTime) {
                result.put(TweetsPeriod.getJsonObject());
            }
            //broadcast message
            String results = result.toString();
//            Client client = ClientBuilder.newClient();
//            WebTarget target = client.target("http://127.0.0.1:8080/api/liveTweets");
            Message msg = new Message(event.getUuid(), Message.Type.TweetsOverTime, results);
            LiveTweetsBroadcasterSingleton.broadcast(msg);
//            target.request().post(Entity.entity(msg, MediaType.APPLICATION_JSON), Message.class);

            try {
                results = new ObjectMapper().writeValueAsString(eventResource.getTopUsers(event.getUuid(), 10));
                msg = new Message(event.getUuid(), Message.Type.TopPeople, results);
                LiveTweetsBroadcasterSingleton.broadcast(msg);
                //target.request().post(Entity.entity(msg, MediaType.APPLICATION_JSON), Message.class);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }

            //
            //broadcast top facebook pages
            try {
                FacebookDataLogic fbDataLogic = new FacebookDataLogic(event.getUuid());
                String topPages = new ObjectMapper().writeValueAsString(eventResource.getTopFacebookPages(event.getUuid(), 10));
                msg = new Message(event.getUuid(), Message.Type.TopFacebookPages, topPages);
                LiveTweetsBroadcasterSingleton.broadcast(msg);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
            //broadcast top facebook pages by shares
            try {
                FacebookDataLogic fbDataLogic = new FacebookDataLogic(event.getUuid());
                String topPages = new ObjectMapper().writeValueAsString(eventResource.getTopFacebookPagesByShares(event.getUuid(), 10));
                msg = new Message(event.getUuid(), Message.Type.TopFacebookPagesByShares, topPages);
                LiveTweetsBroadcasterSingleton.broadcast(msg);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
            //broadcast top facebook pages by comments
            try {
                FacebookDataLogic fbDataLogic = new FacebookDataLogic(event.getUuid());
                String topPages = new ObjectMapper().writeValueAsString(eventResource.getTopFacebookPagesByComments(event.getUuid(), 10));
                msg = new Message(event.getUuid(), Message.Type.TopFacebookPagesByComments, topPages);
                LiveTweetsBroadcasterSingleton.broadcast(msg);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
            //broadcast top facebook pages by shares
            try {
                FacebookDataLogic fbDataLogic = new FacebookDataLogic(event.getUuid());
                String topPages = new ObjectMapper().writeValueAsString(eventResource.getTopFacebookPagesByLikes(event.getUuid(), 10));
                msg = new Message(event.getUuid(), Message.Type.TopFacebookPagesByLikes, topPages);
                LiveTweetsBroadcasterSingleton.broadcast(msg);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
            //broadcast top facebook pages by shares
            try {
                FacebookDataLogic fbDataLogic = new FacebookDataLogic(event.getUuid());
                String topPages = new ObjectMapper().writeValueAsString(eventResource.getTopFacebookSources(event.getUuid(), 10));
                msg = new Message(event.getUuid(), Message.Type.TopFacebookPagesByPosts, topPages);
                LiveTweetsBroadcasterSingleton.broadcast(msg);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
            //broadcast top facebook pages by comments

            //broadcast top facebook pages by likes

            //broadcast top news sources

            //interval between each broadcast
            try {
                Thread.sleep(defaultBroadcastIntervalInSecs * 1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
