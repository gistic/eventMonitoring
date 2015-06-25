package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import org.gistic.tweetboard.representations.Event;
import org.gistic.tweetboard.representations.EventUuid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.auth.AccessToken;
import twitter4j.auth.RequestToken;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

import javax.ws.rs.*;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Created by osama-hussain on 5/25/15.
 */
@Path("/events")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LoginResource {

    private final String baseDomain = ConfigurationSingleton.getInstance().getBaseDomain();

    @GET
    @Path("/login/twitter")
    public String getTwitterLogicUrl(@QueryParam("hashtags") String hashtags,
                                 @DefaultValue("false") @QueryParam("redirectToHome") String redirectToHome) {
        TwitterConfiguration config = ConfigurationSingleton.getInstance().getTwitterConfiguration();
        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setDebugEnabled(true);
        builder.setOAuthConsumerKey(config.getConsumerKey());
        builder.setOAuthConsumerSecret(config.getConsumerSecret());
        Configuration configuration = builder.build();

        TwitterFactory factory = new TwitterFactory(configuration);
        Twitter twitter = factory.getInstance();
        RequestToken requestToken = null;
        try {
            requestToken = twitter.getOAuthRequestToken("http://"+baseDomain+"/api/events/login/twitter/proxyToken");
        } catch (TwitterException e) {
            e.printStackTrace();
            return "{'error':'could not generate unique twitter token URL'}";
        }
        AuthDao authDao = new AuthDaoImpl();
        authDao.setRequestToken(requestToken.getToken(), requestToken.getTokenSecret());
        authDao.setTempHashtags(requestToken.getToken(), hashtags);
        authDao.setRedirectToHomeFlag(requestToken.getToken(), redirectToHome);
        String authorizationUrl = requestToken.getAuthorizationURL();
        System.out.println(authorizationUrl);
        return "{\"url\":\""+authorizationUrl+"\"}";
    }

    @GET
    @Path("/login/twitter/proxyToken")
    public Response getEventConfig(@QueryParam("oauth_token") String oauthToken,
                                 @QueryParam("oauth_verifier") String oauthVerifier) {
        Logger logger = LoggerFactory.getLogger(this.getClass());
//        System.out.println(oauthToken);
//        System.out.println(oauthVerifier);
        TwitterConfiguration config = ConfigurationSingleton.getInstance().getTwitterConfiguration();
        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setDebugEnabled(true);
        builder.setOAuthConsumerKey(config.getConsumerKey());
        builder.setOAuthConsumerSecret(config.getConsumerSecret());
        builder.setOAuthAccessToken(config.getUserKey());
        builder.setOAuthAccessTokenSecret(config.getUserSecret());
        Configuration configuration = builder.build();

        TwitterFactory factory = new TwitterFactory(configuration);
        Twitter twitter = factory.getInstance();
        AuthDao authDao = new AuthDaoImpl();
        String oauthTokenSecret = authDao.getRequestToken(oauthToken);
        authDao.deleteRequestToken(oauthToken);
        if (oauthTokenSecret == null) return Response.status(HttpURLConnection.HTTP_BAD_REQUEST)
                .entity("{'error':'incorrect token'}")
                .build();

        //Get access token from request token
        AccessToken accessTokenObject = null;
        logger.info("getting oauth access token");
        try {
            accessTokenObject = twitter.getOAuthAccessToken(new RequestToken(oauthToken,
                    oauthTokenSecret), oauthVerifier);
        } catch (TwitterException ex) {
            ex.printStackTrace();
        }
        if (accessTokenObject == null) return Response.serverError().build();//"error in converting request token to access token";

        String accessToken = accessTokenObject.getToken();
        String accessTokenSecret =  accessTokenObject.getTokenSecret();
        logger.info("got oauth access token: " + accessToken);
        String userId = authDao.getUserId(accessToken);
        String screenName  = accessTokenObject.getScreenName();
        String userIdFromTwitter = String.valueOf( accessTokenObject.getUserId() );
        boolean firstTime = false;
        if (userId == null) {
            firstTime = true;
            authDao.setUserId(accessToken, userIdFromTwitter);
        } else {
            //sanity check, should always be true unless twitter server mess up or our DB is broken
            if (!userId.equals(userIdFromTwitter)) return Response.serverError().build();
        }

        //String screenName = accessTokenObject.getScreenName();
        String hashtags = authDao.getTempHashtags(oauthToken);
        authDao.deleteTempHashTags(oauthToken);

        String redirectToHome = authDao.getRedirectToHomeFlag(oauthToken);
        authDao.deleteRedirectToHomeFlag(oauthToken);

        boolean redirectToHomeFlag = Boolean.valueOf(redirectToHome);

        authDao.setAccessTokenSecret(accessToken, accessTokenSecret);
        URI uri  = null;
        if (!redirectToHomeFlag) {
            //make event on user's behalf
            logger.info("making event");
            Client client = ClientBuilder.newClient();
            WebTarget target = client.target("http://127.0.0.1:8080/api/events?authToken=" + accessToken);
            //target.queryParam("authToken", accessToken);
            Event event = new Event(hashtags.split(","));
            //set default profile image
            //String profileImageUrl = "http://s.twimg.com/a/1292022067/images/default_profile_2_reasonably_small.png";
            EventUuid eventUuid = target.request().post(Entity.entity(event, MediaType.APPLICATION_JSON)).readEntity(EventUuid.class);
            logger.info("made event with uuid: " + eventUuid.getUuid());
            uri = UriBuilder.fromUri(
                    "http://"+baseDomain+"/hashtag-analyzer/#/dashboard/liveStreaming?hashtags=" +hashtags
                            +"&authToken="+accessToken
                            +"&userId="+userId
                            +"&screenName="+screenName
                            +"&uuid="+eventUuid.getUuid()
                    //+"&profileImageUrl="+profileImageUrl
            ).build();
        } else {
            uri = UriBuilder.fromUri(
                    "http://" + baseDomain + "/hashtag-analyzer/"
                            + "?authToken=" + accessToken
                            + "&userId=" + userId
                            + "&screenName=" + screenName
            ).build();
        }
//        try {
//            profileImageUrl = twitter.showUser(Long.parseLong(userIdFromTwitter)).getBiggerProfileImageURLHttps();
//        } catch (TwitterException e) {
//            e.printStackTrace();
//        }

//                .queryParam("token", accessToken)
//                .queryParam("hashtags", hashtags)
//                .queryParam("firstTime", String.valueOf(firstTime)).build();
        return Response.seeOther(uri).build();
//        return Response.serverError().build();
    }
}
