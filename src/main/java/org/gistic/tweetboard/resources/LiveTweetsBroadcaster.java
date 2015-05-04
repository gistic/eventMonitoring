package org.gistic.tweetboard.resources;

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
@Path("/broadcast")
public class LiveTweetsBroadcaster {

    private Map<String, SseBroadcaster> broadcasters = new HashMap<>();

    @POST
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.TEXT_PLAIN)
    public String broadcastMessage(String message) {
        String[] splitMessage = message.split(":", 2);
        String uuid = splitMessage[0];
        String tweetText = splitMessage[1];
        OutboundEvent.Builder eventBuilder = new OutboundEvent.Builder();
        EventUuid e = new EventUuid();
        e.setUuid(message);
        OutboundEvent event = eventBuilder
                .name("key")
                .mediaType(MediaType.TEXT_PLAIN_TYPE)
                .data(String.class, tweetText)
                .build();
        try {
            SseBroadcaster broadcaster = broadcasters.get(uuid);
            broadcaster.broadcast(event);
        } catch (NullPointerException ex) {
            LoggerFactory.getLogger(this.getClass()).info("No one listening for event: "+uuid);
        }
        return "Message '" + message + "' has been broadcast.";
    }

    @GET
    @Produces(SseFeature.SERVER_SENT_EVENTS)
    public EventOutput listenToBroadcast(@NotNull @QueryParam("uuid") String uuid) {
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