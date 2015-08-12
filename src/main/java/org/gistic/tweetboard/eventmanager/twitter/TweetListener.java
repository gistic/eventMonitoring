package org.gistic.tweetboard.eventmanager.twitter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.google.common.eventbus.EventBus;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import twitter4j.StallWarning;
import twitter4j.Status;
import twitter4j.StatusAdapter;
import twitter4j.TwitterObjectFactory;
import twitter4j.json.DataObjectFactory;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Created by Osama-GIS on 4/22/2015.
 */
public final class TweetListener extends StatusAdapter {
    private final EventBus bus;
    private String[] hashtags;
    TweetListener(EventBus bus, String[] hashtags) {
        this.bus = checkNotNull(bus);
        this.hashtags = hashtags;
    }

    @Override
    public void onStatus(Status status) {
        for (String hashtag : hashtags) {
            if (StringUtils.containsIgnoreCase(status.getText(), hashtag)) {
//                String tweet = TwitterObjectFactory.getRawJSON(status);
                //Status To JSON String
                ObjectMapper mapper =  new ObjectMapper();
                mapper.setPropertyNamingStrategy(PropertyNamingStrategy.CAMEL_CASE_TO_LOWER_CASE_WITH_UNDERSCORES);
                String tweet = "{}";
                try {
                    tweet = mapper.writeValueAsString(status);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
                InternalStatus iStatus = new InternalStatus(status, tweet);
                bus.post(iStatus);
                return;
            }
        }
    }

    @Override
    public void onStallWarning(StallWarning warning) {
        bus.post(warning);
    }
}
