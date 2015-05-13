package org.gistic.tweetboard.delayedjob;

import org.gistic.tweetboard.Util.Misc;
import org.slf4j.LoggerFactory;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;

/**
 * Created by osama-hussain on 5/13/15.
 */
public class DestroyEventAction implements Runnable{
    private final String uuid;

    public DestroyEventAction(String uuid) {
        this.uuid = uuid;
    }

    @Override
    public void run() {
        //TODO implement
        LoggerFactory.getLogger(this.getClass()).info("destroy event triggered for event: "+uuid);
        Client client = ClientBuilder.newClient();
        WebTarget target = client.target(Misc.getBaseUri()+"/api/events/"+uuid);
        target.request().delete();
    }
}
