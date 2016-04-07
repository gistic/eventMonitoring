package org.gistic.tweetboard.dao;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import org.gistic.tweetboard.representations.Keyword;
import org.json.*;

public class KeywordsDao {

	public Keyword[] getKeywords(){
		
	    String jsonData = readFile("related_keywords.json");
	    JSONObject jobj = new JSONObject(jsonData);
	    
	    JSONArray jarr = jobj.getJSONArray("keywords");
	    Keyword[] keywordsArray = new Keyword[jarr.length()];
	    
	    for(int i = 0; i < jarr.length(); i++) {
	    	String keyword = jarr.getJSONObject(i).getString("keyword").toString();
	    	JSONArray relatedWords = jarr.getJSONObject(i).getJSONArray("related_words");
	    	keywordsArray[i] = new Keyword(keyword, relatedWords.toString().replace("[", "").replace("]", "").split(","));
	    		    	
//	    	System.out.println(keywordsArray[i].getKeyword());
//	    	String[] tmp = keywordsArray[i].getRelatedWords();
//	    	for ( String relatedWord : tmp) {
//		        System.out.println(relatedWord+" u");
//			}
	    }
		return keywordsArray;
	}
	
	public boolean createKeyword(String keywordString, String[] relatedWordsStringArray){
	    
		String jsonData = readFile("related_keywords.json");
	    JSONObject jobj = new JSONObject(jsonData);
	    JSONArray jarr = jobj.getJSONArray("keywords");
	    
	    ArrayList<String> previousKeywords = new ArrayList<String>();
	    
		for (int i = 0; i < jarr.length(); i++) { 
			previousKeywords.add(jarr.getJSONObject(i).getString("keyword"));
		}
		
		if(previousKeywords.contains(keywordString)){ //check for duplicates
			return false;
		}else{
			JSONObject jo = new JSONObject();
		    jo.put("keyword", keywordString);
		    jo.put("related_words", relatedWordsStringArray);

		    jarr.put(jo);

		    JSONObject mainObj = new JSONObject();
		    mainObj.put("keywords", jarr);
		    
		    writeToFile(mainObj.toString());
		    return true;
		}
		
	}
	
	public boolean deleteKeyword(String keyword){
		
		boolean foundAndDeleted = false;
		
		String jsonData = readFile("related_keywords.json");
	    JSONObject jobj = new JSONObject(jsonData);
	    JSONArray jarr = jobj.getJSONArray("keywords");
	    JSONArray newJarr = new JSONArray();

	    for (int i = 0; i < jarr.length(); i++) {
			if(!(jarr.getJSONObject(i).getString("keyword").equals(keyword))){
				newJarr.put(jarr.getJSONObject(i));
			}else{
				foundAndDeleted = true;
			}
		}
	    
	    JSONObject newJobj = new JSONObject();
	    newJobj.put("keywords", newJarr);
	    
	    writeToFile(newJobj.toString());

	    return foundAndDeleted;
		
	}
	
	private static void writeToFile(String jsonBody){
		
		try {

			File file = new File("related_keywords.json");

			FileWriter fw = new FileWriter(file.getAbsoluteFile());
			BufferedWriter bw = new BufferedWriter(fw);
			bw.write(jsonBody.toString());
			bw.close();

		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private static String readFile(String filename) {
	    String result = "";
	    try {
	        BufferedReader br = new BufferedReader(new FileReader(filename));
	        StringBuilder sb = new StringBuilder();
	        String line = br.readLine();
	        while (line != null) {
	            sb.append(line);
	            line = br.readLine();
	        }
	        result = sb.toString();
	    } catch(Exception e) {
	        e.printStackTrace();
	    }
	    return result;
	}
}
