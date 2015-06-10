package org.gistic.tweetboard.datalogic;

import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import org.gistic.tweetboard.security.User;
import org.gistic.tweetboard.util.Misc;
import twitter4j.Twitter;
import twitter4j.TwitterException;

/**
 * Created by osama-hussain on 6/8/15.
 */
public class TwitterUserDataLogic {

    public twitter4j.User getUserProfile(User user, String screenName) {
        Twitter twitter = Misc.getTwitter(user);
        try {
            return twitter.showUser(screenName);
        } catch (TwitterException e) {
            e.printStackTrace();
        }
        return null;
    }

    public String getUserProfile(User user) throws TwitterException {
        Twitter twitter = Misc.getTwitter(user);
        AuthDao authDao = new AuthDaoImpl();
        return authDao.getOrUpdateUserDetailsInCache(user);
        //return twitter.verifyCredentials();
    }


}
