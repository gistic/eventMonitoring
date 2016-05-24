package org.gistic.tweetboard.resources;

import java.util.List;

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
import org.json.JSONArray;
import org.json.JSONObject;

@Path("/keywords")
public class KeywordsBroadcaster {

	
	@GET
    @Produces(MediaType.APPLICATION_JSON)
	public List<Keyword> getKeywords(){
		KeywordsDataLogic kdl = new KeywordsDataLogic();
		return kdl.getKeywords();
	}
	
	@GET
	@Path("/{keyword_id}/period")
	@Produces(MediaType.APPLICATION_JSON)
	public int getKeywordPeriod(@PathParam("keyword_id") int keyword_id){
		KeywordsDataLogic kdl = new KeywordsDataLogic();
		return kdl.getKeywordPeriod(keyword_id);
	}
	
	@POST
	@Path("/{keyword_id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public void setKeywordConf(@PathParam("keyword_id") int keyword_id, String conf){
		JSONObject obj = new JSONObject(conf);
		
		KeywordsDataLogic kdl = new KeywordsDataLogic();
		
		kdl.updateKeywordPeriod(obj.getInt("period"), keyword_id);
		kdl.removeRegisteredEmails(keyword_id);
		JSONArray arr = obj.getJSONArray("emails");
		for(int i=0; i<arr.length(); i++) {
	        kdl.setRegisteredEmails(keyword_id, arr.getInt(i));
	    }
	}
	
	@GET
	@Path("/{keyword_id}/emails")
	@Produces(MediaType.APPLICATION_JSON)
	public List<Integer> getKeywordEmails(@PathParam("keyword_id") int keyword_id){
		KeywordsDataLogic kdl = new KeywordsDataLogic();
		return kdl.getKeywordEmails(keyword_id);
	}
		
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public void createKeyword(String keywordObj){
		
		JSONObject jObj = new JSONObject(keywordObj);
		KeywordsDataLogic kdl = new KeywordsDataLogic();
		kdl.createKeyword(jObj.getString("keyword"), jObj.getString("relatedWords").split(","));
	}
	
	
	@DELETE
	@Path("/{keyword}")
	public void deleteKeyword(@PathParam("keyword") int keyword){
		KeywordsDataLogic kdl = new KeywordsDataLogic();
		kdl.deleteKeyword(keyword);

	}

	
}
