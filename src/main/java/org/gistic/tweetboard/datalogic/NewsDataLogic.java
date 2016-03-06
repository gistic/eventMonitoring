package org.gistic.tweetboard.datalogic;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

import org.gistic.tweetboard.dao.NewsDao;

import jersey.repackaged.com.google.common.collect.ImmutableList;

public class NewsDataLogic {
	private static final ImmutableList<String> spiders = ImmutableList.copyOf(Arrays.asList("makkah_newspaper").iterator());
	private String uuid;
	
	public NewsDataLogic(String uuid){
		this.uuid = uuid;
	}
	
	public void callScrapySpiders(String[] keywords){
		try{
			URL url = new URL("http://localhost:6800/schedule.json");
		
			HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
			
			httpCon.setDoOutput(true);
			httpCon.setRequestMethod("POST");
	
			String urlParameters = "project=newspiders&spider=makkah_newspaper&euuid="+uuid+"&keywords="+String.join(",", keywords);
			System.out.println("==============\n"+urlParameters+"\n\n\n\n\n\n");
			
			// Send post request
			httpCon.setDoOutput(true);
			OutputStream wr = httpCon.getOutputStream();
			wr.write(urlParameters.getBytes(StandardCharsets.UTF_8));
			wr.flush();
			
		    BufferedReader rd = new BufferedReader(new InputStreamReader(httpCon.getInputStream()));
		    String line;
		    while ((line = rd.readLine()) != null) {
		      System.out.println(line);
		    }
		    System.out.println("==============\n");
		    wr.close();
		    rd.close();
		  
		} catch (IOException e) {
			// TODO Auto-generated catch block
			System.err.println("Check scrapyd status...");
		}

	}
	
	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
	}
	
	public static void main(String[] args) {
		NewsDataLogic ndl = new NewsDataLogic("9f383997-67c0-4b24-acf4-4d0f47fa3ec7");
		String[] keywords = new String[1];
		keywords[0] = "hajj";
		ndl.callScrapySpiders(keywords);
	}


}


