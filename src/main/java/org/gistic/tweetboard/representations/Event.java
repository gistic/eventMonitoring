package org.gistic.tweetboard.representations;

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
    private  String[] hashTags;

    Event() {}

    Event(String[] hashTags) {
        this.hashTags = hashTags;
    }
    public String[] getHashTags() {
        return hashTags;
    }

    public void setHashTags(String[] hashTags) {
        this.hashTags = hashTags;
    }
}
