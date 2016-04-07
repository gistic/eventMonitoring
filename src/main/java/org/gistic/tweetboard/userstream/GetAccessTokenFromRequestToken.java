package org.gistic.tweetboard.userstream;

import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.auth.AccessToken;
import twitter4j.auth.RequestToken;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

/**
 * Created by osama-hussain on 5/24/15.
 */
public class GetAccessTokenFromRequestToken {
    public static void main(String args[]) throws Exception {
        // The factory instance is re-useable and thread safe.
        Twitter twitter = TwitterFactory.getSingleton();
        //ConfigurationBuilder

        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setDebugEnabled(true);
        builder.setOAuthConsumerKey("6PPRgLzPOf6Mvcj3NkPIlq07Y");
        builder.setOAuthConsumerSecret("Xl3TKJwNQtZmbYGhLcXzUseO9CrdoMav54qODCr2CnFiSIIZpb");
        builder.setOAuthAccessToken("1974931724-iUek6BFqWg3SSyuTMfTDhvL5DrzDGDkClgd9yB");
        builder.setOAuthAccessTokenSecret("3SrUJH57ROyLlIoTle81CP1LDtbWDlGf4ew4tocDekuil");
        Configuration configuration = builder.build();

        TwitterFactory factory = new TwitterFactory(configuration);
        twitter = factory.getInstance();
//        RequestToken requestToken = twitter.getOAuthRequestToken("http://requestb.in/11kw81i1");
//        System.out.println(requestToken.getAuthenticationURL());
//        twitter.getOAuthAccessToken("");
//        twitter.getConfiguration().se
//        new RequestToken("", "");
//        twitter.getoauth
        AccessToken accessToken = null;
        try {
            accessToken = twitter.getOAuthAccessToken(new RequestToken("3K9ioFsLrHCTMrclIBPtLFNHwQjXgvlM",
                    "M7AMrZ37Y2lihvJRZDMfYsiWgi9dou95"), "RuKaq850guuDbXKkpDYJE3temNYe1MsI");
        } catch (TwitterException ex) {
            ex.printStackTrace();
        }
        //twitter.getoau
        //TwitterUtil
        if (accessToken == null) return;
        //System.out.println(accessToken.getToken());
        //System.out.println(accessToken.getTokenSecret());

    }
}
