package org.gistic.tweetboard.userstream;

import org.gistic.tweetboard.eventmanager.twitter.EventServiceDetails;
import org.gistic.tweetboard.eventmanager.twitter.TweetListener;
import twitter4j.*;
import twitter4j.auth.AccessToken;
import twitter4j.conf.ConfigurationBuilder;

/**
 * Created by osama-hussain on 5/21/15.
 */
public class UserstreamRunner {
    public static void main(String args[]) throws Exception{
        StatusListener listener = new StatusListener(){
            public void onStatus(Status status) {
                System.out.println(status.getUser().getName() + " : " + status.getText());
            }
            public void onDeletionNotice(StatusDeletionNotice statusDeletionNotice) {}
            public void onTrackLimitationNotice(int numberOfLimitedStatuses) {}

            @Override
            public void onScrubGeo(long l, long l1) {

            }

            @Override
            public void onStallWarning(StallWarning stallWarning) {

            }

            public void onException(Exception ex) {
                ex.printStackTrace();
            }
        };
//        TwitterStream twitterStream = new TwitterStreamFactory();
//        twitterStream.addListener(listener);
//        // sample() method internally creates a thread which manipulates TwitterStream and calls these adequate listener methods continuously.
//        twitterStream.sample();

        TwitterStreamFactory streamFactory = new TwitterStreamFactory(new ConfigurationBuilder().setJSONStoreEnabled(true).build());
        TwitterStream sampleStream = streamFactory.getInstance();
        sampleStream.setOAuthConsumer("6PPRgLzPOf6Mvcj3NkPIlq07Y", "Xl3TKJwNQtZmbYGhLcXzUseO9CrdoMav54qODCr2CnFiSIIZpb");
        sampleStream.setOAuthAccessToken(new AccessToken("3163968042-ZebHP949SLSOYNCNijJbet2750yrISMtGm208NV",
                "PqWOVyOxbCqTvmBXBS25UPhJNOe2XubyosSYhUv93GsSi"));
        //TweetListener tweetListener = new TweetListener(bus, hashTags);
        //eventDetailsMap.put(uuid, new EventServiceDetails(tweetListener, bus, hashTags));
        sampleStream.addListener(listener);
        //FilterQuery fq = new FilterQuery();
//        fq.track(hashTags);
//        sampleStream.addListener(tweetListener);
//        sampleStream.filter(fq);
        sampleStream.user(new String[]{"smile"});
    }
}
