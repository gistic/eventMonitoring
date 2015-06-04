package org.gistic.tweetboard.representations;

import io.dropwizard.validation.SizeRange;
import org.hibernate.validator.constraints.NotEmpty;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * Created by sohussain on 4/5/15.
 */
public class Event {
//    private final String eventId;
//    private final String[] hashTags;
//
//    Event(String eventId, String[] hashTags) {
//        this.eventId = eventId;
//        this.hashTags = hashTags;
//    }
//    public String getEventId() {
//        return eventId;
//    }
//    public String[] getHashTags() {
//        return hashTags;
//    }
    @NotNull @Size(min = 1, max = 1)
    private  String[] hashTags;

    Event() {}

    public Event(String[] hashTags) {
        this.hashTags = hashTags;
    }
    public String[] getHashTags() {
        return hashTags;
    }

    public void setHashTags(String[] hashTags) {
        this.hashTags = hashTags;
    }
}
