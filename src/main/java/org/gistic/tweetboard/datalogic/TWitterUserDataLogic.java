package org.gistic.tweetboard.datalogic;

import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.security.User;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

/**
 * Created by osama-hussain on 6/8/15.
 */
public class TwitterUserDataLogic {

    public twitter4j.User getUserProfile(User user, String screenName) {
        TwitterConfiguration twitterConfiguration = ConfigurationSingleton.
                getInstance().getTwitterConfiguration();
        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setDebugEnabled(true);
        builder.setOAuthConsumerKey(twitterConfiguration.getConsumerKey());
        builder.setOAuthConsumerSecret(twitterConfiguration.getConsumerSecret());
        builder.setOAuthAccessToken(user.getAccessToken());
        builder.setOAuthAccessTokenSecret(user.getAccessTokenSecret());
        Configuration configuration = builder.build();

        TwitterFactory factory = new TwitterFactory(configuration);
        Twitter twitter = factory.getInstance();
        try {
            return twitter.showUser(screenName);
        } catch (TwitterException e) {
            e.printStackTrace();
        }
        return null;
    }
}
