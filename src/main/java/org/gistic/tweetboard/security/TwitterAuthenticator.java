package org.gistic.tweetboard.security;

import com.google.common.base.Optional;
import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;

/**
 * Created by osama-hussain on 5/27/15.
 */
public class TwitterAuthenticator implements Authenticator<TwitterCredentials, User>{
    @Override
    public Optional<User> authenticate(TwitterCredentials credentials) throws AuthenticationException {

        String accessToken = credentials.getAccessToken();
        AuthDao authDao = new AuthDaoImpl();
        String accessTokenSecret = authDao.getAccessTokenSecret(accessToken);


    }
}
