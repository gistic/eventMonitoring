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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.gistic.tweetboard.dao.KeywordsDao;
import org.gistic.tweetboard.dao.NewsDao;
import org.gistic.tweetboard.representations.GenericArray;
import org.gistic.tweetboard.representations.Keyword;

import jersey.repackaged.com.google.common.collect.ImmutableList;

public class NewsDataLogic {
	private static final ImmutableList<String> spiders = ImmutableList.copyOf(Arrays.asList("akhbarak", "google_news").iterator());
	private String uuid;
	private NewsDao newsDao;
	
	public NewsDataLogic(String uuid){
		this.uuid = uuid;
		this.newsDao = new NewsDao();
	}
	
	public void callScrapySpiders(String[] keywords){
		try{
			URL url = new URL("http://localhost:6800/schedule.json");
			
			for (String spider : spiders) {
				
				ArrayList<String> newKeywords = (new KeywordsDataLogic(new KeywordsDao())).getRelatedWords(keywords); // check if it's registered with a system keyword

				String newKeywordsString = String.join(",", newKeywords).replace("\"", "");
				
				HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
				
				httpCon.setDoOutput(true);
				httpCon.setRequestMethod("POST");
		
				String urlParameters = "project=newspiders&spider="+spider+"&euuid="+uuid+"&keywords="+newKeywordsString;
				System.out.println(newKeywordsString);
				
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
		} 
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
		return this.newsDao.getSavedNewsFromRedis(this.uuid);
	}
	
	public static void main(String[] args) {
		NewsDataLogic ndl = new NewsDataLogic("197a8f76-0ce1-4f8f-8295-080fc8ee0b28");
		String[] k = new String[2];
		k[0]= "وزارة الحج";
		k[1]= "lwn";
		ndl.callScrapySpiders(k);
		
//		System.out.println("الوزير".equals("وزارة"));
}


}


