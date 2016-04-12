package org.gistic.tweetboard.dao;

import org.gistic.tweetboard.representations.FacebookPage;
import org.gistic.tweetboard.representations.Keyword;
import org.gistic.tweetboard.util.Misc;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;

public class FacebookPagesDao {
	
	public FacebookPage[] getFacebookPages(){
		
	    String jsonData = Misc.readJsonFile("facebook_pages.json");
	    JSONObject jobj = new JSONObject(jsonData);
	    
	    JSONArray jarr = jobj.getJSONArray("facebook_pages");
	    FacebookPage[] facebookPagesAray = new FacebookPage[jarr.length()];
	    
	    for(int i = 0; i < jarr.length(); i++) {
	    	String pageName = jarr.getJSONObject(i).getString("name").toString();
	    	String pageScreenName = jarr.getJSONObject(i).getString("screen_name").toString();
	    	facebookPagesAray[i] = new FacebookPage(pageName, pageScreenName);
	    		    	
	    }
		return facebookPagesAray;

	}
	
	public boolean createFacebookpage(String pageName, String pageScreenName){
	    
	    String jsonData = Misc.readJsonFile("facebook_pages.json");
	    JSONObject jobj = new JSONObject(jsonData);
	    JSONArray jarr = jobj.getJSONArray("facebook_pages");
	    
	    ArrayList<String> previousPages = new ArrayList<String>();
	    
		for (int i = 0; i < jarr.length(); i++) { 
			previousPages.add(jarr.getJSONObject(i).getString("name"));
		}
		
		if(previousPages.contains(pageName)){ //check for duplicates
			return false;
		}else{
			JSONObject jo = new JSONObject();
		    jo.put("name", pageName);
		    jo.put("screen_name", pageScreenName);

		    jarr.put(jo);

		    JSONObject mainObj = new JSONObject();
		    mainObj.put("facebook_pages", jarr);
		    
		    Misc.writeToJsonFile("facebook_pages.json", mainObj.toString());
		    return true;
		}
		
	}
	
	public boolean deleteFacebookPage(String pageName){
		
		boolean foundAndDeleted = false;
		
		String jsonData = Misc.readJsonFile("facebook_pages.json");
	    JSONObject jobj = new JSONObject(jsonData);
	    JSONArray jarr = jobj.getJSONArray("facebook_pages");
	    JSONArray newJarr = new JSONArray();

	    for (int i = 0; i < jarr.length(); i++) {
			if(!(jarr.getJSONObject(i).getString("name").equals(pageName))){
				newJarr.put(jarr.getJSONObject(i));
			}else{
				foundAndDeleted = true;
			}
		}
	    
	    JSONObject newJobj = new JSONObject();
	    newJobj.put("facebook_pages", newJarr);
	    
	    Misc.writeToJsonFile("facebook_pages.json", newJobj.toString());

	    return foundAndDeleted;
		
	}

}
