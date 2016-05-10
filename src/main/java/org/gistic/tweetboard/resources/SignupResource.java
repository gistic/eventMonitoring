package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.dao.AuthDao;
import org.gistic.tweetboard.dao.AuthDaoImpl;
import org.gistic.tweetboard.dao.TweetDao;
import org.gistic.tweetboard.dao.TweetDaoImpl;
import org.gistic.tweetboard.representations.Event;
import org.gistic.tweetboard.representations.EventMeta;
import org.gistic.tweetboard.representations.EventUuid;
import org.gistic.tweetboard.representations.UserSignupDetails;
import org.json.JSONArray;
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
import java.util.List;

/**
 * Created by osama-hussain on 5/10/16.
 */
@Path("/events")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SignupResource {

    private final String baseDomain = ConfigurationSingleton.getInstance().getBaseDomain();

    @POST
    @Path("/signup/eventyzer")
    public String getTwitterLoginUrl(
            UserSignupDetails userSignupDetails,
            @QueryParam("hashtags") String hashtags,
            @DefaultValue("false") @QueryParam("redirectToHome") String redirectToHome,
            @DefaultValue("false") @QueryParam("eventyzer") String eventyzerFlagString) {

    }

    @GET
    @Path("/login/twitter/proxyToken")
    public Response getEventConfig(@QueryParam("oauth_token") String oauthToken,
                                   @QueryParam("oauth_verifier") String oauthVerifier) {
    }

}

