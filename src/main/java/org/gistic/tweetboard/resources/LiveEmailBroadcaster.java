package org.gistic.tweetboard.resources;

import java.util.List;

import javax.ws.rs.*;

import javax.ws.rs.core.MediaType;

import org.gistic.tweetboard.dao.EmailDao;
import org.gistic.tweetboard.dao.FacebookPagesDao;
import org.gistic.tweetboard.dao.JdbiSingleton;
import org.gistic.tweetboard.datalogic.EmailsDataLogic;
import org.gistic.tweetboard.datalogic.FacebookPagesDataLogic;
import org.gistic.tweetboard.representations.Email;
import org.json.JSONObject;


@Path("emails")
public class LiveEmailBroadcaster {

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public List<Email> getEmails(){
		EmailsDataLogic edl = new EmailsDataLogic ( JdbiSingleton.getInstance().onDemand(EmailDao.class) );
		return edl.getEmails();
	}
	
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	public boolean createEmail(String emailObj){
		System.out.println("=======\n\n\n\n");
		System.out.println(emailObj);
		
		JSONObject jObj = new JSONObject(emailObj);
		EmailsDataLogic edl = new EmailsDataLogic ( JdbiSingleton.getInstance().onDemand(EmailDao.class) );
		return edl.createEmail(jObj.getString("firstName"), jObj.getString("lastName"), jObj.getString("email"));
	}
	
	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/{email_id}")
	public boolean deleteEmail(@PathParam("email_id")int email_id){
		
		EmailsDataLogic edl = new EmailsDataLogic ( JdbiSingleton.getInstance().onDemand(EmailDao.class) );
		return edl.deleteEmail(email_id);
	}
	
	
	
	
}
