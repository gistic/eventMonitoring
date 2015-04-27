package org.gistic.tweetboard.representations;

/**
 * Created by Osama-GIS on 4/21/2015.
 */
public class TopUsers {
    TopUser[] topUsers;

    public TopUser[] getTopUsers() {
        return topUsers;
    }

    public void setTopUsers(TopUser[] topUsers) {
        this.topUsers = topUsers;
    }

    public TopUsers(TopUser[] topUsers) {
        this.topUsers = topUsers;
    }
}
