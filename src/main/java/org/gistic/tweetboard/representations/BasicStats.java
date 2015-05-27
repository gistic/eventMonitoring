package org.gistic.tweetboard.representations;

/**
 * Created by osama-hussain on 5/6/15.
 */
public class BasicStats {
    private String startTime;
    private Long numberOfUsers;

    public String getStartTime() {
        return startTime;
    }

    public Long getNumberOfUsers() {
        return numberOfUsers;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public void setNumberOfUsers(Long numberOfUsers) {
        this.numberOfUsers = numberOfUsers;
    }

    public void setTotalTweets(Long totalTweets) {
        this.totalTweets = totalTweets;
    }

    public void setTotalRetweets(Long totalRetweets) {
        this.totalRetweets = totalRetweets;
    }

    public Long getTotalTweets() {
        return totalTweets;
    }

    public Long getTotalRetweets() {
        return totalRetweets;
    }

    private Long totalTweets;
    private Long totalRetweets;

    public BasicStats(String startTime, Long numberOfUsers, Long totalTweets, Long totalRetweets) {

        this.startTime = startTime;
        this.numberOfUsers = numberOfUsers;
        this.totalTweets = totalTweets;
        this.totalRetweets = totalRetweets;
    }
}
