package org.gistic.tweetboard.resources;

import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.SseBroadcaster;
import org.glassfish.jersey.media.sse.SseFeature;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

/**
 * Created by osama-hussain on 5/12/15.
 */
@Singleton
@Path("/events/{uuid}/adminEventSource")
public class AdminEventSource {

    private SseBroadcaster broadcaster = new SseBroadcaster();

    @GET
    @Produces(SseFeature.SERVER_SENT_EVENTS)
    public EventOutput getServerSentEvents() {

    }
}
