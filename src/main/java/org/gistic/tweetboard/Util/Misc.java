package org.gistic.tweetboard.util;

import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.security.User;
import twitter4j.Twitter;
import twitter4j.TwitterFactory;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

/**
 * Created by osama-hussain on 5/13/15.
 */
public class Misc {
    public static String getBaseUri() {
        return "http://127.0.0.1:8080";
    }

    public static Twitter getTwitter(User user) {
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
        return factory.getInstance();
    }
}
