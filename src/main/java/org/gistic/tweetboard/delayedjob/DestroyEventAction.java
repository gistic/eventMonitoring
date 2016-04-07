package org.gistic.tweetboard.delayedjob;

import org.gistic.tweetboard.Util.Misc;
import org.slf4j.LoggerFactory;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;

/**
 * Created by osama-hussain on 5/13/15.
 */
public class DestroyEventAction implements Runnable{
    private final String uuid;
    private final String accessToken;

    public DestroyEventAction(String uuid, String accessToken) {
        this.uuid = uuid;
        this.accessToken = accessToken;
    }

    @Override
    public void run() {
        //TODO implement
        LoggerFactory.getLogger(this.getClass()).info("destroy event triggered for event: "+uuid);
        Client client = ClientBuilder.newClient();
        WebTarget target = client.target(Misc.getBaseUri()+"/api/events/"+uuid);
        if (accessToken != null && !accessToken.equalsIgnoreCase("undefined")) {
            target = target.queryParam("authToken", accessToken);
        }
        target.request().delete();
    }
}
