package org.gistic.tweetboard.resources;

import io.dropwizard.auth.Auth;
import org.gistic.tweetboard.DelayedJobsManager;
import org.gistic.tweetboard.dao.TweetDao;
import org.gistic.tweetboard.dao.TweetDaoImpl;
import org.gistic.tweetboard.datalogic.TweetDataLogic;
import org.gistic.tweetboard.eventmanager.*;
import org.gistic.tweetboard.eventmanager.twitter.TweetsOverTimeAnalyzer;
import org.gistic.tweetboard.eventmanager.twitter.WarmupRunnable;
import org.gistic.tweetboard.representations.*;
import org.gistic.tweetboard.representations.Event;
import org.gistic.tweetboard.security.User;
import org.gistic.tweetboard.util.GmailSender;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.JSONArray;
import org.json.JSONException;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;

import javax.mail.MessagingException;
import javax.validation.Valid;
import javax.ws.rs.Path;
import javax.ws.rs.Consumes;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.POST;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.QueryParam;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.core.Context;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Created by sohussain on 3/29/15.
 */
@Path("/events")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EventsResource {

    private org.gistic.tweetboard.eventmanager.Event checkUuid(@PathParam("uuid") String uuid) {
        org.gistic.tweetboard.eventmanager.Event event = EventMap.get(uuid);
        if (event == null) throw new WebApplicationException(
                Response.status(HttpURLConnection.HTTP_BAD_REQUEST)
                        .entity("{'error':'incorrect uuid'}")
                        .build()
        );
        return event;
    }

    @POST
    public EventUuid createEvent(@Valid Event event, @DefaultValue("undefined") @QueryParam("email") String email,
                                 @Context Jedis jedis,
                                 @DefaultValue("undefined") @QueryParam("authToken") String authToken,
                                 @Auth(required = false) User user) {
        String[] hashTags = event.getHashTags();
        String uuid = UUID.randomUUID().toString();
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        if (user == null) {
            //invalid token tweetboard v2.0
            throw new WebApplicationException(
                    Response.status(HttpURLConnection.HTTP_BAD_REQUEST)
                            .entity("{'error':'incorrect token'}")
                            .build()
            );
        } else if (user.isNoUser()) {
            //for tweetboard v1.0
            EventMap.put(hashTags, tweetDataLogic, uuid);
            //invalid token
        }
        else {
            //valid token tweetboard v2.0
            EventMap.putV2(hashTags, tweetDataLogic, uuid, authToken);
            ExecutorSingleton.getInstance().submit(new WarmupRunnable(checkUuid(uuid), tweetDataLogic, hashTags, authToken));
        }
        EventUuid eventUuid = new EventUuid();
        eventUuid.setUuid(uuid);
        if(!email.equalsIgnoreCase("undefined")) {
            try {
                GmailSender.send(uuid, email);
            } catch (MessagingException e) {
                LoggerFactory.getLogger(this.getClass()).error("Failed to send email to: " + email + " for event: " + uuid);
            }
        }
        DelayedJobsManager.createEventDestroyJob(uuid);
        return eventUuid;
    }

    @DELETE
    @Path("/{uuid}")
    public Response deleteEvent(@PathParam("uuid") String uuid,
                                @DefaultValue("undefined") @QueryParam("authToken") String authToken,
                                @Auth(required = false) User user) {
        checkUuid(uuid);
        EventMap.delete(uuid);
        return Response
                .ok()
                .build();
    }



    @GET
    @Path("/{uuid}/config")
    public EventConfig getEventConfig(@PathParam("uuid") String uuid) {
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        EventConfig config = tweetDataLogic.getEventConfig(uuid);
        config.setModerated(event.isModeration());
        config.setRetweetEnabled(event.isRetweetsEnabled());
        return config;
    }

    @PUT
    @Path("/{uuid}/config")
    public Response updateEventConfig(
            @PathParam("uuid") String uuid, EventConfig eventConfig, @Context Jedis jedis) {
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.updateEventConfig(eventConfig);
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return Response
                .ok("")
                .build();
    }

    @DELETE
    @Path("/{uuid}/moderation")
    public Response disableModeration(
            @PathParam("uuid") String uuid, @Context Jedis jedis) {
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.setModeration(false);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.approveAllTweets();
        return Response
                .ok("")
                .build();
    }

    @PUT
    @Path("/{uuid}/moderation")
    public Response enableModeration(
            @PathParam("uuid") String uuid, @Context Jedis jedis) {
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.setModeration(true);
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return Response
                .ok("")
                .build();
    }

    @DELETE
    @Path("/{uuid}/retweets")
    public Response disableRetweets(
            @PathParam("uuid") String uuid, @Context Jedis jedis) {
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.setRetweetsEnabled(false);
        return Response
                .ok("")
                .build();
    }

    @PUT
    @Path("/{uuid}/retweets")
    public Response enableRetweets(
            @PathParam("uuid") String uuid, @Context Jedis jedis) {
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.setRetweetsEnabled(true);
        return Response
                .ok("")
                .build();
    }

    @POST
    @Path("/{uuid}/approvedTweets/{tweetId}")
    public Response approveTweet(@PathParam("uuid") String uuid, @PathParam("tweetId") String tweetId,
                                 @DefaultValue("false") @QueryParam("starred") String star) {
        checkUuid(uuid);
        boolean starred = Boolean.parseBoolean(star);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.addToApproved(tweetId, starred);
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return Response.ok("").build();
    }

    @POST
    @Path("/{uuid}/approvedTweets/all")
    public Response approveAllTweet(@PathParam("uuid") String uuid) {
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.approveAllTweets();
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return Response.ok("").build();
    }

    @POST
    @Path("/{uuid}/blockedTweets/{tweetId}")
    public Response blockTweet(@PathParam("uuid") String uuid, @PathParam("tweetId") String tweetId) {
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.addToBlocked(tweetId);
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return Response.ok("").build();
    }

    //CRUD Trusted users
    @PUT
    @Path("/{uuid}/trustedUsers/{screenName}")
    public Response addTrustedUser(@PathParam("uuid") String uuid, @PathParam("screenName") String screenName) {
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.addTrustedUser(screenName);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.approveAllExistingTweetsByUser(screenName);
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return Response.ok("").build();
    }

    @DELETE
    @Path("/{uuid}/trustedUsers/{screenName}")
    public Response deleteTrustedUser(@PathParam("uuid") String uuid, @PathParam("screenName") String screenName) {
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.deleteTrustedUser(screenName);
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return Response.ok("").build();
    }

    @GET
    @Path("/{uuid}/trustedUsers/")
    public String getTrustedUsers(@PathParam("uuid") String uuid) {

        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        List<String> list = event.getTrustedUsers();
        try {
            return new JSONArray(list.toArray(new String[list.size()])).toString();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return new JSONArray().toString();
    }

    // CRUD Blocked Users
    @GET
    @Path("/{uuid}/blockedUsers/")
    public String getBlockedUsers(@PathParam("uuid") String uuid) {

        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        List<String> list = event.getBlockedUsers();
        try {
            return new JSONArray(list.toArray(new String[list.size()])).toString();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return new JSONArray().toString();
    }

    @PUT
    @Path("/{uuid}/blockedUsers/{screenName}")
    public Response addBlockedUser(@PathParam("uuid") String uuid, @PathParam("screenName") String screenName) {
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.addBlockedUser(screenName);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.blockAllExistingTweetsByUser(screenName);
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return Response.ok("").build();
    }

    @DELETE
    @Path("/{uuid}/blockedUsers/{screenName}")
    public Response deleteBlockedUser(@PathParam("uuid") String uuid, @PathParam("screenName") String screenName) {
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.deleteBlockedUser(screenName);
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return Response.ok("").build();
    }

    @GET
    @Path("/{uuid}/topUsers/")
    public TopUsers getTopUsers(@PathParam("uuid") String uuid,
                                @DefaultValue("10") @QueryParam("count") Integer count) {
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        // TopUser arraylist to array ... TODO: refactor
        List<TopUser> topUserList = tweetDataLogic.getTopTenNUsers(count);
        TopUser[] topUsers = new TopUser[topUserList.size()];
        topUsers = topUserList.toArray(topUsers);
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return new TopUsers(topUsers);
    }

    @GET
    @Path("/{uuid}/topCountries/")
    public GenericArray<TopItem> getTopCountries(@PathParam("uuid") String uuid,
                                @DefaultValue("10") @QueryParam("count") Integer count) {
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        return tweetDataLogic.getTopNCountries(count);
    }

    @GET
    @Path("/{uuid}/topLanguages/")
    public GenericArray<TopItem> getTopLanguages(@PathParam("uuid") String uuid,
                                                 @DefaultValue("10") @QueryParam("count") Integer count) {
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        return tweetDataLogic.getTopNLanguages(count);
    }

    @GET
    @Path("/{uuid}/topHashtags/")
    public GenericArray<TopItem> getTopHashtags(@PathParam("uuid") String uuid,
                                                 @DefaultValue("10") @QueryParam("count") Integer count) {
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        return tweetDataLogic.getTopNHashtags(count);
    }

    @GET
    @Path("/{uuid}/topTweets/")
    public GenericArray<String> getTopTweets(@PathParam("uuid") String uuid,
                                             @DefaultValue("10") @QueryParam("count") Integer count,
                                             @DefaultValue("undefined") @QueryParam("authToken") String authToken,
                                             @Auth(required = false) User user) {
        //TODO test auth!

        checkUuid(uuid);
        if (user==null || user.isNoUser()) {
            Response.status(HttpURLConnection.HTTP_BAD_REQUEST)
                    .entity("{'error':'incorrect token'}")
                    .build();
        }
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        return tweetDataLogic.getTopNTweets(count, authToken);
    }

    @GET
    @Path("/{uuid}/overTime/")
    public String getTweetsOverTime(@PathParam("uuid") String uuid,
                                    @DefaultValue("-1") @QueryParam("period") Integer period,
                                    @DefaultValue("1") @QueryParam("sampleRate") Integer sampleRate) {
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        List<TweetsOverTimeAnalyzer.TweetsCountPerTime> tweetsPerTime = event.getTweetsPerTime(sampleRate, period);
        JSONArray result = new JSONArray();
        for (TweetsOverTimeAnalyzer.TweetsCountPerTime TweetsPeriod : tweetsPerTime) {
            result.put(TweetsPeriod.getJsonObject());
        }
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return result.toString();
    }

    @GET
    @Path("/superAdmin/")
    public EventMetaList getSuperAdmin() {
        TweetDao dao = new TweetDaoImpl();
        return dao.getEventMetaList();
    }

    @GET
    @Path("/{uuid}/basicStats")
    public BasicStats getbasicStats(@PathParam("uuid") String uuid) {
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return tweetDataLogic.getBasicStats(uuid);
    }

    @POST
    @Path("/{uuid}/logo")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadFile(
            @PathParam("uuid") String uuid,
            @FormDataParam("file") InputStream uploadedInputStream,
            @FormDataParam("file") FormDataContentDisposition fileDetail
    ) throws IOException {
        /*
        works with
        <input id="the-file" name="file" type="file">
        var fileInput = document.getElementById('the-file');
        var file = fileInput.files[0];
        var formData = new FormData();
        formData.append('file', file);
        xhr.open('POST', 'http://localhost:8080/api/events/{uuid}/logo', true);
        xhr.send(formData);
         */
        System.out.println(fileDetail.getSize());
        //todo refactor
        String uploadedFileLocation = "./assets/logo/"+uuid+"/";// + fileDetail.getFileName();
        String fileName =fileDetail.getFileName();
        System.out.println(fileName);
        String fileType = fileName.substring(fileName.lastIndexOf("."));
        writeToFile(uploadedInputStream, uploadedFileLocation, fileType);
        String output = "File uploaded to : " + uploadedFileLocation;
        uploadedInputStream.close();
        DelayedJobsManager.refreshEventDestroyJob(uuid);
        return Response.ok(output).build();
    }

    // save uploaded file to new location
    private void writeToFile(InputStream uploadedInputStream, String uploadedFileLocation, String fileType) throws IOException {
        java.nio.file.Path outputPath = FileSystems.getDefault().getPath(uploadedFileLocation, "logo" + fileType);
        System.out.println(Files.isDirectory(outputPath));
        final java.nio.file.Path tmp = outputPath.getParent();
        if (tmp != null) // null will be returned if the path has no parent
            Files.createDirectories(tmp);

        Files.copy(uploadedInputStream, outputPath, StandardCopyOption.REPLACE_EXISTING);
    }

    @GET
    @Path("/{uuid}/cachedTweets")
    public GenericArray<String> getCachedTweets(@PathParam("uuid") String uuid,
                                             @DefaultValue("undefined") @QueryParam("authToken") String authToken,
                                             @Auth(required = false) User user) {
        checkUuid(uuid);
        if (user==null) {
            Response.status(HttpURLConnection.HTTP_BAD_REQUEST)
                    .entity("{'error':'incorrect token'}")
                    .build();
        }
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        return tweetDataLogic.getCachedTweets();
    }


}
