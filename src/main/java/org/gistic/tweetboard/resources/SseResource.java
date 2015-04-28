package org.gistic.tweetboard.resources;

import org.eclipse.jetty.servlets.EventSource;
import org.eclipse.jetty.servlets.EventSourceServlet;
import org.gistic.tweetboard.eventmanager.Event;
import org.gistic.tweetboard.eventmanager.EventMap;
import org.gistic.tweetboard.eventmanager.twitter.InternalStatus;
import twitter4j.Status;
import twitter4j.TwitterObjectFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * Created by sohussain on 4/12/15.
 */

public class SseResource extends EventSourceServlet {
    private static final long serialVersionUID = 1L;

    protected EventSource newEventSource(final HttpServletRequest req) {
        String uuid = req.getParameter("uuid");
        if (uuid != null){
            return new EventSource() {
                private boolean connected;

                public void onOpen(final Emitter emitter) throws IOException {
                    connected = true;
                    System.out.println("Tweets queue connection opened");
                    while (connected) {
                        Event e = EventMap.get(uuid);
                        try {
                            if (e != null) {
                                InternalStatus status = e.getOldestTweetNotSentForApproval();//EventMonitor.getCurrentEventMonitor().tweetsApproving.getTweetToAdmin();
                                if (status == null) {
                                    Thread.sleep(1000);
                                } else {
                                    Status tweet = status.getInternalStatus();
                                    try { emitter.data(status.getStatusString().replace("_normal", "")); }
                                    catch (Exception ex) { break; }
                                    //Thread.sleep(100);
                                }
                            } else {
                                Thread.sleep(500);
                            }
                        } catch (Exception ex) {
                            ex.printStackTrace();
                        }
                    }
                    emitter.close();
                }

                public void onClose() {
                    System.out.println("Tweets queue connection closed");
                    connected = false;
                }
            };
            //TODO : handle errors
        } else throw new RuntimeException();
    }
}