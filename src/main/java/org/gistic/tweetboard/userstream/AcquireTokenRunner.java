package org.gistic.tweetboard.userstream;

import twitter4j.Status;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.auth.AccessToken;
import twitter4j.auth.RequestToken;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

import java.io.BufferedReader;
import java.io.InputStreamReader;

/**
 * Created by osama-hussain on 5/21/15.
 */
public class AcquireTokenRunner {
    public static void main(String args[]) throws Exception{
        // The factory instance is re-useable and thread safe.
        Twitter twitter = TwitterFactory.getSingleton();
        //ConfigurationBuilder

        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setDebugEnabled(true);
        builder.setOAuthConsumerKey("6PPRgLzPOf6Mvcj3NkPIlq07Y");
        builder.setOAuthConsumerSecret("Xl3TKJwNQtZmbYGhLcXzUseO9CrdoMav54qODCr2CnFiSIIZpb");
        Configuration configuration = builder.build();

        TwitterFactory factory = new TwitterFactory(configuration);
        twitter = factory.getInstance();

        //twitter.setOAuthConsumer("YzZKKQ2v793ClhDvOvpg2XtNO", "vQToihSmBVtZK6ziYKORtGNWKxAGEVUAxo5VyuHxPRBQk8JNgw");
        RequestToken requestToken = twitter.getOAuthRequestToken("http://requestb.in/11kw81i1");
//        System.out.println(requestToken.getAuthenticationURL());
//        System.out.println(requestToken.getAuthorizationURL());
//        System.out.println(requestToken.getToken());
//        System.out.println(requestToken.getTokenSecret());


//        AccessToken accessToken = null;
//        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
//        while (null == accessToken) {
//            System.out.println("Open the following URL and grant access to your account:");
//            System.out.println(requestToken.getAuthorizationURL());
//            System.out.print("Enter the PIN(if aviailable) or just hit enter.[PIN]:");
//            String pin = br.readLine();
//            try{
//                if(pin.length() > 0){
//                    accessToken = twitter.getOAuthAccessToken(requestToken, pin);
//                }else{
//                    accessToken = twitter.getOAuthAccessToken();
//                }
//            } catch (TwitterException te) {
//                if(401 == te.getStatusCode()){
//                    System.out.println("Unable to get the access token.");
//                }else{
//                    te.printStackTrace();
//                }
//            }
//        }
//        //persist to the accessToken for future reference.
//        storeAccessToken(twitter.verifyCredentials().getId(), accessToken);
//        Status status = twitter.updateStatus(args[0]);
//        System.out.println("Successfully updated the status to [" + status.getText() + "].");
        System.exit(0);
    }
    private static void storeAccessToken(long useId, AccessToken accessToken){
        System.out.println("user token is: "+accessToken.getToken());
        System.out.println("user token secret is: "+accessToken.getTokenSecret());
        //store accessToken.getToken()
        //store accessToken.getTokenSecret()
    }
}
