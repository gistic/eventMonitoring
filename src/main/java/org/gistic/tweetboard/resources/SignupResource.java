package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.dao.*;
import org.gistic.tweetboard.representations.Event;
import org.gistic.tweetboard.representations.EventMeta;
import org.gistic.tweetboard.representations.EventUuid;
import org.gistic.tweetboard.representations.UserSignupDetails;
import org.gistic.tweetboard.security.EmailCode;
import org.gistic.tweetboard.util.GmailSender;
import org.json.JSONArray;
import org.postgresql.util.PSQLException;
import org.skife.jdbi.v2.exceptions.UnableToExecuteStatementException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.auth.AccessToken;
import twitter4j.auth.RequestToken;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

import javax.mail.MessagingException;
import javax.validation.Valid;
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
import java.sql.SQLException;
import java.util.List;
import javax.ws.rs.core.Response;

/**
 * Created by osama-hussain on 5/10/16.
 */
@Path("/events")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SignupResource {

    private final String baseDomain = ConfigurationSingleton.getInstance().getBaseDomain();

    private final AuthDbDao authDbDao;

    public SignupResource(AuthDbDao authDbDao) {
        this.authDbDao = authDbDao;
    }

    @POST
    @Path("/signup/eventyzer")
    public String signup(
            @Valid UserSignupDetails userSignupDetails,
            @QueryParam("hashtags") String hashtags,
            @DefaultValue("false") @QueryParam("redirectToHome") String redirectToHome,
            @DefaultValue("false") @QueryParam("eventyzer") String eventyzerFlagString) {
        try {
            authDbDao.addNewUser(userSignupDetails);
            String email = userSignupDetails.getEmail();
            System.out.println("email :"+email);
            if(!email.equalsIgnoreCase("undefined")) {

                //TODO: generate email code and store
                String code = EmailCode.getToken(5);
                authDbDao.deleteAllActivationCodes(email);
                authDbDao.storeEmailActivationCode(email, code);
                System.out.println("sending activation to: "+email+" with code: "+ code);
                try {
                    GmailSender.send(email, code);
                } catch (MessagingException e) {
                    e.printStackTrace();
                    LoggerFactory.getLogger(this.getClass()).error("Failed to send email to: " + email + " for address: " + email);
                }
            }
        } catch (UnableToExecuteStatementException ex) {
            if (ex.getCause() instanceof  PSQLException) {
                PSQLException e = (PSQLException) ex.getCause();
                return "{\"errors\":[\""+e.getMessage().replace('"', '\'')+"\"]}";
            } else {
                ex.printStackTrace();
            }
        }
        return "";


    }

    @GET
    @Path("/signup/emailActivation")
    public  Response emailActivation(@QueryParam("email") String email,
                                     @QueryParam("code") String code) {

        URI uri = UriBuilder.fromUri(
                "http://" + baseDomain + "/hashtag-analyzer/"
                          + "success/"
//                        + "?authToken=" + accessToken
//                        + "&userId=" + userId
//                        + "&screenName=" + screenName
        ).build();

        int result = authDbDao.checkEmailActivationCode(email, code);

        if (result == 1) {
            //TODO set account active in DB
            authDbDao.activateAccount(email);
            //TODO delete code from DB
            authDbDao.deleteAllActivationCodes(email);
            //TODO redirect to activation success
            return Response.seeOther(uri).build();
        }

        uri = UriBuilder.fromUri(
                "http://" + baseDomain + "/hashtag-analyzer/"
                        + "fail/"
//                        + "?authToken=" + accessToken
//                        + "&userId=" + userId
//                        + "&screenName=" + screenName
        ).build();

        return Response.seeOther(uri).build();

    }

//    @GET
//    @Path("/login/twitter/proxyToken")
//    public Response getEventConfig(@QueryParam("oauth_token") String oauthToken,
//                                   @QueryParam("oauth_verifier") String oauthVerifier) {
//        return null;
//    }

}

