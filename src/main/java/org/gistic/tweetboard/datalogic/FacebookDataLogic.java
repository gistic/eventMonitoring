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
import java.util.Set;
import java.util.stream.Collectors;

import org.gistic.tweetboard.dao.FacebookDao;
import org.gistic.tweetboard.dao.NewsDao;
import org.gistic.tweetboard.representations.GenericArray;

import jersey.repackaged.com.google.common.collect.ImmutableList;
import org.gistic.tweetboard.representations.TopItem;
import redis.clients.jedis.Tuple;

public class FacebookDataLogic {
	private String uuid;
	private FacebookDao facebookDao;
	
	public FacebookDataLogic(String uuid){
		this.uuid = uuid;
		this.facebookDao = new FacebookDao();
	}
	
	public void callScrapySpiders(String[] keywords){
		try{
			URL url = new URL("http://localhost:6800/schedule.json");
			
				
			
				HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
				
				httpCon.setDoOutput(true);
				httpCon.setRequestMethod("POST");
		
				String urlParameters = "project=newspiders&spider=facebook"+"&euuid="+uuid+"&fb_pages=130459710303842&fb_pages_names=اخبارك&keywords="+String.join(",", keywords);
				
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

	public GenericArray<String> getSavedNews() {
		return this.facebookDao.getSavedNewsFromRedis(this.uuid);
	}

	public GenericArray<TopItem> getTopNSources(Integer count) {
		Set<Tuple> topSourcesTuple = facebookDao.getTopNSources(uuid, count);
		TopItem[] topNSourcesArray = topSourcesTuple.stream()
				.map(source -> new TopItem(source.getElement(), new Double(source.getScore()).intValue()))
				.collect(Collectors.toList()).toArray(new TopItem[]{});
		return new GenericArray<TopItem>(topNSourcesArray);
	}
}


