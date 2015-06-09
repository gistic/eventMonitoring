package org.gistic.tweetboard.resources;

import io.dropwizard.auth.Auth;
import org.gistic.tweetboard.dao.TweetDaoImpl;
import org.gistic.tweetboard.datalogic.TweetDataLogic;
import org.gistic.tweetboard.datalogic.TwitterUserDataLogic;
import org.gistic.tweetboard.representations.GenericArray;
import org.gistic.tweetboard.security.User;
import twitter4j.TwitterException;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.HttpURLConnection;

/**
 * Created by osama-hussain on 6/8/15.
 */
@Path("/twitterUsers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TwitterUserResource {

    @GET
    @Path("/{screenName}")
    public twitter4j.User getUserFromScreenName(@PathParam("screenName") String screenName,
                                       @Auth User user) {
        if (user==null || user.isNoUser()) {
            Response.status(HttpURLConnection.HTTP_BAD_REQUEST)
                    .entity("incorrect auth token")
                    .build();
        }
        TwitterUserDataLogic userDataLogic = new TwitterUserDataLogic();
        return userDataLogic.getUserProfile(user, screenName);
    }

    @GET
    public twitter4j.User getLoggedInUser(@Auth(required = true) User user) {
        if (user==null || user.isNoUser()) {
            Response.status(HttpURLConnection.HTTP_BAD_REQUEST)
                    .entity("incorrect auth token")
                    .build();
        }
        TwitterUserDataLogic userDataLogic = new TwitterUserDataLogic();
        try {
            return userDataLogic.getUserProfile(user);
        } catch (TwitterException e) {
            e.printStackTrace();
            throw new WebApplicationException(
                    Response.status(HttpURLConnection.HTTP_BAD_REQUEST)
                            .entity("{'error':'error getting user details'}")
                            .build());
        }
    }
}
