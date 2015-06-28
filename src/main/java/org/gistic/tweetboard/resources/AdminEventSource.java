package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.DelayedJobsManager;
import org.gistic.tweetboard.datalogic.InternalStatusJson;
import org.gistic.tweetboard.eventmanager.Event;
import org.gistic.tweetboard.eventmanager.EventMap;
import org.gistic.tweetboard.eventmanager.twitter.InternalStatus;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.OutboundEvent;
import org.glassfish.jersey.media.sse.SseBroadcaster;
import org.glassfish.jersey.media.sse.SseFeature;
import org.json.JSONObject;
import org.slf4j.LoggerFactory;
import twitter4j.Status;

import javax.inject.Singleton;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by osama-hussain on 5/12/15.
 */
@Singleton
@Path("/events/{uuid}/adminEventSource")
public class AdminEventSource {

    private Map<String, EventOutput> eventOutputs = new HashMap<>();
    @GET
    @Produces(SseFeature.SERVER_SENT_EVENTS)
    public EventOutput getServerSentEvents(@PathParam("uuid") final String uuid) throws IOException {
        EventOutput eventOutput = this.eventOutputs.get(uuid);
        if (eventOutput != null) {
            System.out.println("Auto closing admin event source.");
            final OutboundEvent.Builder eventBuilder = new OutboundEvent.Builder();
            eventBuilder.name("new-admin-opened");
            eventBuilder.data(String.class, "shutDownStream");
            final OutboundEvent event = eventBuilder.build();
            try {
                eventOutput.write(event);
            } catch (IOException e) {
                LoggerFactory.getLogger(this.getClass()).info("admin tab probably refresehed");
            }
//            try {
//                Thread.sleep(2000l);
//            } catch (InterruptedException e) {
//                e.printStackTrace();
//            }
            eventOutput.close();
            this.eventOutputs.remove(uuid);
        }
        eventOutput = new EventOutput();
        this.eventOutputs.put(uuid, eventOutput);
        final EventOutput finalEventOutput = eventOutput;
        Thread t = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("Admin event source opened");
                while (!Thread.currentThread().isInterrupted()) {
                    if (finalEventOutput.isClosed()) break;
                    Event e = EventMap.get(uuid);
                    try {
                        if (e != null) {
                            InternalStatusJson status = e.getOldestTweetNotSentForApproval();//EventMonitor.getCurrentEventMonitor().tweetsApproving.getTweetToAdmin();
                            if (status == null) {
                                Thread.sleep(1000);
                            } else {
                                //Status tweet = status.getInternalStatus();
                                JSONObject json = status.getStatus();
                                json.put( "id_str", String.valueOf(json.getLong("id")) );
                                String statusString = json.toString();
                                final OutboundEvent.Builder eventBuilder = new OutboundEvent.Builder();
                                eventBuilder.name("tweet");
                                eventBuilder.data(String.class, statusString.replace("_normal", ""));
                                final OutboundEvent event = eventBuilder.build();
                                finalEventOutput.write(event);
                                DelayedJobsManager.refreshEventDestroyJob(uuid, null);
                            }
                        } else {
                            Thread.sleep(500);
                        }
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                }
            }
        });
        t.start();
        return eventOutput;
    }
}
