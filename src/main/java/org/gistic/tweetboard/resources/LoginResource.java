package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.auth.AccessToken;
import twitter4j.auth.RequestToken;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Created by osama-hussain on 5/25/15.
 */
@Path("/events")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LoginResource {

    @GET
    @Path("/login/twitter")
    public String getEventConfig(@QueryParam("hashtags") String hashtags) {
        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setDebugEnabled(true);
        builder.setOAuthConsumerKey("6PPRgLzPOf6Mvcj3NkPIlq07Y");
        builder.setOAuthConsumerSecret("Xl3TKJwNQtZmbYGhLcXzUseO9CrdoMav54qODCr2CnFiSIIZpb");
        Configuration configuration = builder.build();

        TwitterFactory factory = new TwitterFactory(configuration);
        Twitter twitter = factory.getInstance();
        RequestToken requestToken = null;
        try {
            requestToken = twitter.getOAuthRequestToken("http://localhost:8080/api/events/login/twitter/proxyToken");
        } catch (TwitterException e) {
            e.printStackTrace();
        }
        AuthDao authDao = new AuthDaoImpl();
        authDao.setRequestToken(requestToken.getToken(), requestToken.getTokenSecret());
        authDao.setTempHashtags(requestToken.getToken(), hashtags);
        String authorizationUrl = requestToken.getAuthorizationURL();
        System.out.println(authorizationUrl);
        return "{\"url\":\""+authorizationUrl+"\"}";
    }

    @GET
    @Path("/login/twitter/proxyToken")
    public Response getEventConfig(@QueryParam("oauth_token") String oauthToken,
                                 @QueryParam("oauth_verifier") String oauthVerifier) {
        System.out.println(oauthToken);
        System.out.println(oauthVerifier);
        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setDebugEnabled(true);
        builder.setOAuthConsumerKey("6PPRgLzPOf6Mvcj3NkPIlq07Y");
        builder.setOAuthConsumerSecret("Xl3TKJwNQtZmbYGhLcXzUseO9CrdoMav54qODCr2CnFiSIIZpb");
        builder.setOAuthAccessToken("1974931724-iUek6BFqWg3SSyuTMfTDhvL5DrzDGDkClgd9yB");
        builder.setOAuthAccessTokenSecret("3SrUJH57ROyLlIoTle81CP1LDtbWDlGf4ew4tocDekuil");
        Configuration configuration = builder.build();

        TwitterFactory factory = new TwitterFactory(configuration);
        Twitter twitter = factory.getInstance();
        AuthDao authDao = new AuthDaoImpl();
        String oauthTokenSecret = authDao.getRequestToken(oauthToken);
        if (oauthTokenSecret == null) return Response.serverError().build();//"invalid oauth token";

        //Get access token from request token
        AccessToken accessTokenObject = null;
        try {
            accessTokenObject = twitter.getOAuthAccessToken(new RequestToken(oauthToken,
                    oauthTokenSecret), oauthVerifier);
        } catch (TwitterException ex) {
            ex.printStackTrace();
        }
        if (accessTokenObject == null) return Response.serverError().build();//"error in converting request token to access token";

        String accessToken = accessTokenObject.getToken();
        String accessTokenSecret =  accessTokenObject.getTokenSecret();

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

        authDao.setAccessTokenSecret(accessToken, accessTokenSecret);
        URI uri = UriBuilder.fromUri("http://localhost:8080/hashtag-analyzer/#/home?hashtags=" +hashtags
                +"&authToken="+accessToken
                +"&userId="+userId
                +"&screenName="+screenName).build();
                //+"&uuid="+uuid)
//                .queryParam("token", accessToken)
//                .queryParam("hashtags", hashtags)
//                .queryParam("firstTime", String.valueOf(firstTime)).build();
        return Response.seeOther(uri).build();
//        return Response.serverError().build();
    }
}
