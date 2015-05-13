package org.gistic.tweetboard.delayedjob;

import org.slf4j.LoggerFactory;

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
    }
}
