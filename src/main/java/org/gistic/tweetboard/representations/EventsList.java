package org.gistic.tweetboard.representations;

import java.util.List;

/**
 * Created by osama-hussain on 6/23/15.
 */
public class EventsList {
    private String[] trendingHashtags;
    private List<EventMeta> runningServerEvents;
    private List<HistoricUserEvent> historicUserEvents;

    public List<EventMeta> getRunningUserEvents() {
        return runningUserEvents;
    }

    public void setRunningUserEvents(List<EventMeta> runningUserEvents) {
        this.runningUserEvents = runningUserEvents;
    }

    public List<EventMeta> getRunningServerEvents() {
        return runningServerEvents;
    }

    public void setRunningServerEvents(List<EventMeta> runningServerEvents) {
        this.runningServerEvents = runningServerEvents;
    }

    private List<EventMeta> runningUserEvents;

    public void setTrendingHashtags(String[] trendingHashtags) {
        this.trendingHashtags = trendingHashtags;
    }

    public String[] getTrendingHashtags() {
        return trendingHashtags;
    }

    public void setHistoricUserEvents(List<HistoricUserEvent> historicUserEvents) {
        this.historicUserEvents = historicUserEvents;
    }

    public List<HistoricUserEvent> getHistoricUserEvents() {
        return historicUserEvents;
    }
}
