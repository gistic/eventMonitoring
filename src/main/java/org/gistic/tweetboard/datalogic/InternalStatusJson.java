package org.gistic.tweetboard.datalogic;

import org.gistic.tweetboard.eventmanager.twitter.InternalStatus;
import org.json.JSONObject;

/**
 * Created by osama-hussain on 6/28/15.
 */
public class InternalStatusJson  {
    public String getStatusString() {
        return statusString;
    }

    public JSONObject getStatus() {

        return status;
    }

    private final JSONObject status;
    private final String statusString;

    public InternalStatusJson(JSONObject status, String statusString) {
        this.status = status;
        this.statusString = statusString;
    }
}
