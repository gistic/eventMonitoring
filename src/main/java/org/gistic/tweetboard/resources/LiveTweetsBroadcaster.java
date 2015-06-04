package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.eventmanager.Message;
import org.gistic.tweetboard.representations.EventUuid;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.OutboundEvent;
import org.glassfish.jersey.media.sse.SseBroadcaster;
import org.glassfish.jersey.media.sse.SseFeature;
import org.slf4j.LoggerFactory;

import javax.inject.Singleton;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by osama-hussain on 5/4/15.
 */
@Singleton
@Path("/liveTweets")
public class LiveTweetsBroadcaster {

    private Map<String, SseBroadcaster> broadcasters = new HashMap<>();


    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public synchronized String broadcastMessage(Message msg) {
        String uuid = msg.getUuid();
        String message = msg.getMsg();
        OutboundEvent.Builder eventBuilder = new OutboundEvent.Builder();
        String type = msg.getType();
        switch (type) {
            case Message.Type.LiveTweet:
                OutboundEvent event = eventBuilder
                        .name("approved-tweets")
                        .mediaType(MediaType.TEXT_PLAIN_TYPE)
                        .data(String.class, message.replace("_normal", ""))
                        .build();
                try {
                    SseBroadcaster broadcaster = broadcasters.get(uuid);
                    broadcaster.broadcast(event);
                } catch (NullPointerException ex) {
                    LoggerFactory.getLogger(this.getClass()).info("No one listening for event: " + uuid);
                }
                break;
            case Message.Type.UiUpdate:
                event = eventBuilder
                        .name("broadcast-ui-customization")
                        .mediaType(MediaType.TEXT_PLAIN_TYPE)
                        .data(String.class, message)
                        .build();
                try {
                    broadcasters.get(uuid).broadcast(event);
                } catch (NullPointerException ex) {
                    LoggerFactory.getLogger(this.getClass()).info("No one listening for event: " + uuid);
                }
                break;
            case Message.Type.TweetsOverTime:
                event = eventBuilder
                        .name("tweets-over-time")
                        .mediaType(MediaType.TEXT_PLAIN_TYPE)
                        .data(String.class, message)
                        .build();
                try {
                    broadcasters.get(uuid).broadcast(event);
                } catch (NullPointerException ex) {
                    LoggerFactory.getLogger(this.getClass()).info("No one listening for event: " + uuid);
                }
                break;
        }
        return "{\"msg\":\"Message has been broadcasted.\"}";
    }

    @GET
    @Produces(SseFeature.SERVER_SENT_EVENTS)
    public synchronized EventOutput listenToBroadcast(@NotNull @QueryParam("uuid") String uuid) {
        final EventOutput eventOutput = new EventOutput();
        SseBroadcaster broadcaster = this.broadcasters.get(uuid);
        if (broadcaster == null) {
            broadcaster = new SseBroadcaster();
            this.broadcasters.put(uuid, broadcaster);
        }
        broadcaster.add(eventOutput);
        return eventOutput;
    }
}