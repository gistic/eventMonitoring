package org.gistic.tweetboard.eventmanager.twitter;

import org.gistic.tweetboard.dao.TweetDao;
import org.gistic.tweetboard.eventmanager.Message;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;

/**
 * Created by osama-hussain on 5/7/15.
 */
public class SendApprovedTweets implements Runnable {

    String[] tweetIds;
    TweetDao tweetDao;
    String uuid;

    public SendApprovedTweets(String[] tweetIds, TweetDao tweetDao, String uuid) {
        this.tweetIds = tweetIds;
        this.tweetDao = tweetDao;
        this.uuid =  uuid;
    }

    public void run(){
        for (String tweetId : tweetIds) {
            String statusString = tweetDao.getStatusString(tweetId);
            Client client = ClientBuilder.newClient();
            WebTarget target = client.target("http://127.0.0.1:8080/api/liveTweets");
            Message msg = new Message(uuid, Message.Type.LiveTweet, statusString);
            target.request().post(Entity.entity(msg, MediaType.APPLICATION_JSON), Message.class);
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}