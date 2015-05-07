package org.gistic.tweetboard.resources;

import org.gistic.tweetboard.dao.TweetDao;
import org.gistic.tweetboard.dao.TweetDaoImpl;
import org.gistic.tweetboard.datalogic.TweetDataLogic;
import org.gistic.tweetboard.eventmanager.*;
import org.gistic.tweetboard.eventmanager.twitter.TweetsOverTimeAnalyzer;
import org.gistic.tweetboard.representations.*;
import org.gistic.tweetboard.representations.Event;
import org.json.JSONArray;
import org.json.JSONException;
import redis.clients.jedis.Jedis;

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
import java.net.HttpURLConnection;
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
                        .entity("incorrect uuid")
                        .build()
        );
        return event;
    }

    @POST
    public EventUuid createEvent(@Valid Event event, @Context Jedis jedis) {
        String[] hashTags = event.getHashTags();
        for(String hashTag:hashTags) {
            System.out.println("Hashtag received: "+hashTag);
            jedis.set("latestEventHashTag", hashTag);
        }
        String uuid = UUID.randomUUID().toString();
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        EventMap.put(hashTags, tweetDataLogic, uuid);
        EventUuid eventUuid = new EventUuid();
        eventUuid.setUuid(uuid);
        return eventUuid;
    }

    @DELETE
    @Path("/{uuid}")
    public Response deleteEvent(@PathParam("uuid") String uuid) {
        checkUuid(uuid);
        EventMap.delete(uuid);
        return Response
                .ok()
                .build();
    }

    @GET
    @Path("/{uuid}/config")
    public EventConfig getEventConfig(@PathParam("uuid") String uuid) {
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        return tweetDataLogic.getEventConfig(uuid);
    }

    @PUT
    @Path("/{uuid}/config")
    public Response updateEventConfig(
            @PathParam("uuid") String uuid,EventConfig eventConfig, @Context Jedis jedis) {
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.updateEventConfig(eventConfig);
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
        return Response
                .ok("")
                .build();
    }

    @POST
    @Path("/{uuid}/approvedTweets/{tweetId}")
    public Response approveTweet(@PathParam("uuid") String uuid, @PathParam("tweetId") String tweetId,
                                 @DefaultValue("false") @QueryParam("starred") String star){
        checkUuid(uuid);
        boolean starred = Boolean.parseBoolean(star);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.addToApproved(tweetId, starred);
        return Response.ok("").build();
    }

    @POST
    @Path("/{uuid}/approvedTweets/all")
    public Response approveAllTweet(@PathParam("uuid") String uuid){
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.approveAllTweets();
        return Response.ok("").build();
    }

    @POST
    @Path("/{uuid}/blockedTweets/{tweetId}")
    public Response blockTweet(@PathParam("uuid") String uuid, @PathParam("tweetId") String tweetId){
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.addToBlocked(tweetId);
        return Response.ok("").build();
    }

    //CRUD Trusted users
    @PUT
    @Path("/{uuid}/trustedUsers/{screenName}")
    public Response addTrustedUser(@PathParam("uuid") String uuid, @PathParam("screenName") String screenName){
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.addTrustedUser(screenName);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.approveAllExistingTweetsByUser(screenName);
        return Response.ok("").build();
    }

    @DELETE
    @Path("/{uuid}/trustedUsers/{screenName}")
    public Response deleteTrustedUser(@PathParam("uuid") String uuid, @PathParam("screenName") String screenName){
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.deleteTrustedUser(screenName);
        return Response.ok("").build();
    }

    @GET
    @Path("/{uuid}/trustedUsers/")
    public String getTrustedUsers(@PathParam("uuid") String uuid){

        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        List<String> list = event.getTrustedUsers();
        try {
            return new JSONArray(list.toArray(new String[list.size()])).toString();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return new JSONArray().toString();
    }

    // CRUD Blocked Users
    @GET
    @Path("/{uuid}/blockedUsers/")
    public String getBlockedUsers(@PathParam("uuid") String uuid){

        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        List<String> list = event.getBlockedUsers();
        try {
            return new JSONArray(list.toArray(new String[list.size()])).toString();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return new JSONArray().toString();
    }

    @PUT
    @Path("/{uuid}/blockedUsers/{screenName}")
    public Response addBlockedUser(@PathParam("uuid") String uuid, @PathParam("screenName") String screenName){
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.addBlockedUser(screenName);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        tweetDataLogic.blockAllExistingTweetsByUser(screenName);
        return Response.ok("").build();
    }

    @DELETE
    @Path("/{uuid}/blockedUsers/{screenName}")
    public Response deleteBlockedUser(@PathParam("uuid") String uuid, @PathParam("screenName") String screenName){
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        event.deleteBlockedUser(screenName);
        return Response.ok("").build();
    }

    @GET
    @Path("/{uuid}/topUsers/")
    public TopUsers getTopUsers(@PathParam("uuid") String uuid,
                                @DefaultValue("10") @QueryParam("count") Integer count){
        checkUuid(uuid);
        TweetDataLogic tweetDataLogic = new TweetDataLogic(new TweetDaoImpl(), uuid);
        // TopUser arraylist to array ... TODO: refactor
        List<TopUser> topUserList = tweetDataLogic.getTopTenNUsers(count);
        TopUser[] topUsers = new TopUser[topUserList.size()];
        topUsers = topUserList.toArray(topUsers);
        return new TopUsers(topUsers);
    }

    @GET
    @Path("/{uuid}/overTime/")
    public String getTweetsOverTime(@PathParam("uuid") String uuid,
                                       @DefaultValue("-1") @QueryParam("period") Integer period,
                                       @DefaultValue("1") @QueryParam("sampleRate") Integer sampleRate){
        org.gistic.tweetboard.eventmanager.Event event = checkUuid(uuid);
        List<TweetsOverTimeAnalyzer.TweetsCountPerTime> tweetsPerTime = event.getTweetsPerTime(sampleRate, period);
        JSONArray result = new JSONArray();
        for (TweetsOverTimeAnalyzer.TweetsCountPerTime TweetsPeriod : tweetsPerTime) {
            result.put(TweetsPeriod .getJsonObject());
        }
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
        return tweetDataLogic.getBasicStats(uuid);
    }
}
