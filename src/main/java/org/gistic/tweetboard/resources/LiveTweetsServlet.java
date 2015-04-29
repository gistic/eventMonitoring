package org.gistic.tweetboard.resources;

import org.eclipse.jetty.servlets.EventSource;
import org.eclipse.jetty.servlets.EventSourceServlet;
import org.gistic.tweetboard.eventmanager.Event;
import org.gistic.tweetboard.eventmanager.EventMap;
import org.gistic.tweetboard.eventmanager.twitter.InternalStatus;
import twitter4j.Status;
import twitter4j.TwitterObjectFactory;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

public class LiveTweetsServlet extends EventSourceServlet {
    private static final long serialVersionUID = 1L;

    protected EventSource newEventSource(final HttpServletRequest req) {
        return new EventSource() {
            String uuid = req.getParameter("uuid");
            private boolean connected;
            public void onOpen(final Emitter emitter) throws IOException {
                if (uuid == null || uuid.equalsIgnoreCase("undefined")) {
                    emitter.data("wrong uuid");
                    emitter.close();
                    return;
                }
                connected = true;
                System.out.println("Live tweets connection opened");
                while (connected) {
                    try {
                        Event e = EventMap.get(uuid);
                        if (e != null){
                            InternalStatus status = e.getOldestTweetApprovedNotSentToClient();
                            //Tweet tweet = EventMonitor.getCurrentEventMonitor().tweetsApproving.getTweetToVisualizer();
                            if (status == null){
                                Thread.sleep(500);
                            }else{
                                try {
                                    emitter.data(status.getStatusString().replace("_normal", ""));
                                } catch (Exception ex) { break; }
                                Thread.sleep(3000);
                            }
                        }else{
                            Thread.sleep(500);
                        }

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                //emitter.close();
            }
            public void onClose() {
                connected = false;
                System.out.println("Live tweets connection closed");
            }
        };
    }
}
