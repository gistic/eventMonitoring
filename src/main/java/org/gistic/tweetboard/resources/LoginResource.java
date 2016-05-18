package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.dao.*;
import org.gistic.tweetboard.representations.Event;
import org.gistic.tweetboard.representations.EventMeta;
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
import java.util.List;

/**
 * Created by osama-hussain on 5/25/15.
 */
@Path("/events")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LoginResource {

    private final String baseDomain = ConfigurationSingleton.getInstance().getBaseDomain();

    private final AuthDbDao authDbDao;

    public LoginResource(AuthDbDao authDbDao) {
        this.authDbDao = authDbDao;
    }

    @GET
    @Path("/login/twitter")
    public String getTwitterLoginUrl(@DefaultValue("") @QueryParam("hashtags") String hashtags,
                                 @DefaultValue("false") @QueryParam("redirectToHome") String redirectToHome,
                                 @DefaultValue("false") @QueryParam("eventyzer") String eventyzerFlagString) {
        boolean eventyzerFlag = Boolean.parseBoolean(eventyzerFlagString);
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
        authDao.setEventyzerFlag(requestToken.getToken(), eventyzerFlagString);
        authDao.setRedirectToHomeFlag(requestToken.getToken(), redirectToHome);
        String authorizationUrl = requestToken.getAuthorizationURL();
        //System.out.println(authorizationUrl);
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

        String eventyzerFlagString = authDao.getEventyzerFlag(oauthToken);
        authDao.deleteEventyzerFlag(oauthToken);
        boolean eventyzerFlag = Boolean.parseBoolean(eventyzerFlagString);

        String screenName  = accessTokenObject.getScreenName();
        String userIdFromTwitter = String.valueOf( accessTokenObject.getUserId() );

        boolean firstTime = false;

        //String screenName = accessTokenObject.getScreenName();
        String hashtags = authDao.getTempHashtags(oauthToken);
        authDao.deleteTempHashTags(oauthToken);

        String redirectToHome = authDao.getRedirectToHomeFlag(oauthToken);
        authDao.deleteRedirectToHomeFlag(oauthToken);
        boolean redirectToHomeFlag = Boolean.valueOf(redirectToHome);

        authDao.setAccessTokenSecret(accessToken, accessTokenSecret);

        URI uri  = null;

        //get user id from DB
        String userIdFromDb = null;
        if (eventyzerFlag) {

            //DO: get user ID from eventyzer auth DB table
            int result = authDbDao.isTwitterIdRegistered(userIdFromTwitter);
            if (result == 0) {
                firstTime = true;
            }

            authDao.setUserId(accessToken, userIdFromTwitter);

            if (firstTime) {
                //TODO: redirect to signup page

                uri = UriBuilder.fromUri(
                        "http://" + baseDomain + "/event-monitoring/#/signUp"
                                + "?authToken=" + accessToken
                                + "&userId=" + userIdFromTwitter
                                + "&screenName=" + screenName
                ).build();
            } else {
                //TODO: redirect to home page logged in      //create new event for eventyzer with auth

                uri = UriBuilder.fromUri(
                        "http://" + baseDomain + "/event-monitoring/index.html"
                                + "?authToken=" + accessToken
                                + "&userId=" + userIdFromTwitter
                                + "&screenName=" + screenName
                ).build();
            }

            return Response.seeOther(uri).build();

        } else {
            userIdFromDb = authDao.getUserId(accessToken);
        }

        if (userIdFromDb == null) { //path for HT auth
            //check if user id existed in our system
            firstTime = true;
            authDao.setUserId(accessToken, userIdFromTwitter);
        } else {
            //sanity check, should always be true unless twitter server mess up or our DB is broken
            if (!userIdFromDb.equals(userIdFromTwitter)) return Response.serverError().build();
        }

        if (!redirectToHomeFlag) {
            String uuid = null;
            boolean eventExists = false;
            TweetDao dao = new TweetDaoImpl();
            List<String> userEventIds = dao.getUserEventsList(userIdFromTwitter);
            for (String userEventUuid : userEventIds) {
                EventMeta userEventMeta = dao.getEventMeta(userEventUuid);
                String userEventHashtags = userEventMeta.getHashtags();
                if (userEventHashtags != null && userEventHashtags.toLowerCase().contains(hashtags.toLowerCase()) ){
                    eventExists = true;
                    uuid = userEventUuid;
                }
            }
            if (!eventExists) {
                //make event on user's behalf
                logger.info("making event");
                Client client = ClientBuilder.newClient();
                WebTarget target = client.target("http://127.0.0.1:8080/api/events?authToken=" + accessToken);
                //target.queryParam("authToken", accessToken);
                Event event = new Event(hashtags.split(","));
                EventUuid eventUuid = target.request().post(Entity.entity(event, MediaType.APPLICATION_JSON)).readEntity(EventUuid.class);
                logger.info("made event with uuid: " + eventUuid.getUuid());
                uuid = eventUuid.getUuid();
            }
            uri = UriBuilder.fromUri(
                    "http://"+baseDomain+"/hashtag-analyzer/#/dashboard/liveStreaming?"
                            +"uuid="+uuid
//                            +"hashtags=" +hashtags
                            +"&authToken="+accessToken
//                            +"&userId="+userId
//                            +"&screenName="+screenName

                    //+"&profileImageUrl="+profileImageUrl
            ).build();

            //else redirect to home with auth details
        } else {
            uri = UriBuilder.fromUri(
                    "http://" + baseDomain + "/hashtag-analyzer/"
                            + "?authToken=" + accessToken
                            + "&userId=" + userIdFromDb
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
