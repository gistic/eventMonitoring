package org.gistic.tweetboard.resources;

import org.glassfish.jersey.media.sse.SseBroadcaster;

import javax.inject.Singleton;
import javax.ws.rs.Path;

/**
 * Created by osama-hussain on 5/12/15.
 */
@Singleton
@Path("/events/{uuid}/adminEventSource")
public class AdminEventSource {

    private SseBroadcaster broadcaster = new SseBroadcaster();

}
