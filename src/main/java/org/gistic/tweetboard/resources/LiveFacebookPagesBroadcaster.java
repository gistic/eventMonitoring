package org.gistic.tweetboard.resources;
import javax.ws.rs.*;

import javax.ws.rs.core.MediaType;

import org.gistic.tweetboard.dao.FacebookPagesDao;
import org.gistic.tweetboard.datalogic.FacebookPagesDataLogic;
import org.gistic.tweetboard.representations.FacebookPage;
import org.json.JSONObject;


@Path("/fb_pages")
public class LiveFacebookPagesBroadcaster {
	
	@GET
    @Produces(MediaType.APPLICATION_JSON)
	public FacebookPage[] getFacebookPages(){
		FacebookPagesDataLogic kdl = new FacebookPagesDataLogic(new FacebookPagesDao());
		return kdl.getFacebookPages();
	}
		
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public void createFaceboonPage(String pageObj){
		JSONObject jObj = new JSONObject(pageObj);
		FacebookPagesDataLogic kdl = new FacebookPagesDataLogic(new FacebookPagesDao());
		kdl.createFacebookPage(jObj.getString("name"), jObj.getString("screenName"));

	}
	
	
	@DELETE
	@Path("/{fb_page}")
	public void deleteFacebookPage(@PathParam("fb_page") String fb_page){
		FacebookPagesDataLogic kdl = new FacebookPagesDataLogic(new FacebookPagesDao());
		kdl.deleteFacebookPage(fb_page);

	}
	
}

