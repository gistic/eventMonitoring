package org.gistic.tweetboard.security;

import com.google.common.base.Optional;
import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import org.gistic.tweetboard.datalogic.TwitterUserDataLogic;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

/**
 * Created by osama-hussain on 5/27/15.
 */
public class TwitterAuthenticator implements Authenticator<TwitterCredentials, User>{
    @Override
    public Optional<User> authenticate(TwitterCredentials credentials) throws AuthenticationException {
        String accessToken = credentials.getAccessToken();
        AuthDao authDao = new AuthDaoImpl();
        if (accessToken == null || accessToken.equalsIgnoreCase("undefined")) {return Optional.fromNullable(new User(true));}
        String accessTokenSecret = authDao.getAccessTokenSecret(accessToken);
        if (accessTokenSecret == null || accessTokenSecret.isEmpty()) return Optional.absent();

        User user = new User(accessToken, accessTokenSecret);
        if (checkUser(user)) return Optional.fromNullable(user);
//        if (accessTokenSecret != null && !accessTokenSecret.isEmpty()) return Optional.fromNullable();
        return Optional.absent();
    }

    private boolean checkUser(User user) {
//        TwitterConfiguration twitterConfiguration = ConfigurationSingleton.
//                getInstance().getTwitterConfiguration();
//        ConfigurationBuilder builder = new ConfigurationBuilder();
//        builder.setDebugEnabled(true);
//        builder.setOAuthConsumerKey(twitterConfiguration.getConsumerKey());
//        builder.setOAuthConsumerSecret(twitterConfiguration.getConsumerSecret());
//        builder.setOAuthAccessToken(user.getAccessToken());
//        builder.setOAuthAccessTokenSecret(user.getAccessTokenSecret());
//        Configuration configuration = builder.build();
//
//        TwitterFactory factory = new TwitterFactory(configuration);
        try {
            return new TwitterUserDataLogic().getUserProfile(user) != null;
        } catch (TwitterException e) {
            e.printStackTrace();
        }
        return false;
    }
}
