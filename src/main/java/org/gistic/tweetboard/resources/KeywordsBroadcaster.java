package org.gistic.tweetboard.resources;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.gistic.tweetboard.dao.KeywordsDao;
import org.gistic.tweetboard.datalogic.KeywordsDataLogic;
import org.gistic.tweetboard.representations.Keyword;
import org.json.JSONObject;

@Path("/keywords")
public class KeywordsBroadcaster {

	
	@GET
    @Produces(MediaType.APPLICATION_JSON)
	public Keyword[] getKeywords(){
		KeywordsDataLogic kdl = new KeywordsDataLogic(new KeywordsDao());
		return kdl.getKeywords();
	}
		
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public void createKeyword(String keywordObj){
		
		JSONObject jObj = new JSONObject(keywordObj);
		KeywordsDataLogic kdl = new KeywordsDataLogic(new KeywordsDao());
		kdl.createKeyword(jObj.getString("keyword"), jObj.getString("relatedWords").split(","));

	}
	
	
	@DELETE
	@Path("/{keyword}")
	public void deleteKeyword(@PathParam("keyword") String keyword){
		KeywordsDataLogic kdl = new KeywordsDataLogic(new KeywordsDao());
		kdl.deleteKeyword(keyword);

	}

	
}
