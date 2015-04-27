package org.gistic.tweetboard.eventmanager.twitter;

/**
 * Created by Osama-GIS on 4/16/2015.
 */
public class InternalStatus {
    private twitter4j.Status internalStatus;
    private String statusString;

    public InternalStatus(twitter4j.Status internalStatus, String statusString) {
        this.internalStatus = internalStatus;
        this.statusString = statusString;
    }

    public twitter4j.Status getInternalStatus() {
        return internalStatus;
    }

    public String getStatusString() {
        return statusString;
    }
}
