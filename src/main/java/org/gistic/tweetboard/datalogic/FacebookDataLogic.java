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
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.gistic.tweetboard.JedisPoolContainer;
import org.gistic.tweetboard.dao.FacebookDao;
import org.gistic.tweetboard.dao.FacebookPagesDao;
import org.gistic.tweetboard.dao.KeywordsDao;
import org.gistic.tweetboard.dao.NewsDao;
import org.gistic.tweetboard.representations.FacebookPage;
import org.gistic.tweetboard.representations.GenericArray;
import org.gistic.tweetboard.representations.Keyword;

import jersey.repackaged.com.google.common.collect.ImmutableList;
import org.gistic.tweetboard.representations.TopItem;
import org.json.JSONObject;
import redis.clients.jedis.Tuple;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.exceptions.JedisException;

public class FacebookDataLogic {
	private String uuid;
	private FacebookDao facebookDao;
	private double commentScoreMultiplier = 1.0;
	private double shareScoreMultiplier = 1.0;
	private double likeScoreMultiplier = 1.0;
	
	public FacebookDataLogic(String uuid){
		this.uuid = uuid;
		this.facebookDao = new FacebookDao();
	}
	
	public void callScrapySpiders(String[] keywords){
		try{
			URL url = new URL("http://localhost:6800/schedule.json");
			
				FacebookPagesDataLogic fpdl = new FacebookPagesDataLogic( new FacebookPagesDao());
				FacebookPage[] facebookPages = fpdl.getFacebookPages();
				
				String[] pageNames = new String[facebookPages.length];
				String[] pageIds = new String[facebookPages.length];
				
				for (int i = 0; i < facebookPages.length ; i++) {
					pageNames[i] = facebookPages[i].getName();
					pageIds[i] = facebookPages[i].getScreenName();
				}
				
				ArrayList<String> newKeywords = (new KeywordsDataLogic(new KeywordsDao())).getRelatedWords(keywords); // check if it's registered with a system keyword

				String newKeywordsString = String.join(",", newKeywords).replace("\"", "");

				HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
				
				httpCon.setDoOutput(true);
				httpCon.setRequestMethod("POST");
		
				String urlParameters = "project=newspiders&spider=facebook"+"&euuid="+uuid+"&fb_pages="+String.join(",", pageIds)+"&fb_pages_names="+String.join(",", pageNames)+"&keywords="+newKeywordsString;
				
				try (Jedis jedis = JedisPoolContainer.getInstance()) {
		        	
		            jedis.sadd("events:scrapy_params:"+uuid, urlParameters);
		        	
		        }catch(JedisException e){
		        	e.printStackTrace();
		        }
				
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
				.map(source -> new TopItem(facebookDao.getPageDetails(uuid, source.getElement()), new Double(source.getScore()).intValue()))
				.collect(Collectors.toList()).toArray(new TopItem[]{});
		return new GenericArray<TopItem>(topNSourcesArray);
	}

	public void incrementPageScore(JSONObject obj) {

		JSONObject pageJson = new JSONObject();
		String url = obj.getString("url");
		Matcher m = Pattern.compile("http://facebook\\.com\\/[\\w]+\\/").matcher(url);
		System.out.println("test");
		String pageUrl;
		if(m.find())
		{
			pageUrl = m.group(0);
		} else {
			//TODO throw exception
			return; // fail
		}
		facebookDao.setPageDetails(obj.getString("uuid"), pageUrl, obj);
		String pageDetails = facebookDao.getPageDetails(obj.getString("uuid"), pageUrl);
		long shareScore = (long)(obj.getLong("shares_num")*shareScoreMultiplier);
		long commentsScore = (long)(obj.getLong("comments_num")*commentScoreMultiplier);
		long likesScore = (long)(obj.getLong("likes_num")*likeScoreMultiplier);
		long score = shareScore+commentsScore+likesScore;
		facebookDao.incrPageScore(obj.getString("uuid"), pageUrl, score);
		facebookDao.incrPageSharedCount(obj.getString("uuid"), pageUrl, shareScore);
		facebookDao.incrPageCommentCount(obj.getString("uuid"), pageUrl, commentsScore);
		facebookDao.incrPageLikes(obj.getString("uuid"), pageUrl, likesScore);

	}

	public void incrementPageSource(JSONObject obj) {

		JSONObject pageJson = new JSONObject();
		String url = obj.getString("url");
		Matcher m = Pattern.compile("http://facebook\\.com\\/[\\w]+\\/").matcher(url);
		System.out.println("test");
		String pageUrl;
		if(m.find())
		{
			pageUrl = m.group(0);
		} else {
			//TODO throw exception
			return; // fail
		}
		facebookDao.setPageDetails(obj.getString("uuid"), pageUrl, obj);
		String pageDetails = facebookDao.getPageDetails(obj.getString("uuid"), pageUrl);
		facebookDao.incrSourceCounter(uuid, pageUrl);
	}

	public GenericArray<TopItem> getTopNPages(int count) {
		Set<Tuple> topSourcesTuple = facebookDao.getTopNPages(uuid, count);
		TopItem[] topNPagesArray = topSourcesTuple.stream()
				.map(source -> new TopItem(facebookDao.getPageDetails(uuid, source.getElement()), new Double(source.getScore()).intValue()))
				.collect(Collectors.toList()).toArray(new TopItem[]{});
		return new GenericArray<TopItem>(topNPagesArray);
	}

	public GenericArray<TopItem> getTopNPagesByShares(int count) {
		Set<Tuple> topSourcesTuple = facebookDao.getTopNPagesByShares(uuid, count);
		TopItem[] topNPagesArray = topSourcesTuple.stream()
				.map(source -> new TopItem(facebookDao.getPageDetails(uuid, source.getElement()), new Double(source.getScore()).intValue()))
				.collect(Collectors.toList()).toArray(new TopItem[]{});
		return new GenericArray<TopItem>(topNPagesArray);
	}

	public GenericArray<TopItem> getTopNPagesByComments(int count) {
		Set<Tuple> topSourcesTuple = facebookDao.getTopNPagesByComments(uuid, count);
		TopItem[] topNPagesArray = topSourcesTuple.stream()
				.map(source -> new TopItem(facebookDao.getPageDetails(uuid, source.getElement()), new Double(source.getScore()).intValue()))
				.collect(Collectors.toList()).toArray(new TopItem[]{});
		return new GenericArray<TopItem>(topNPagesArray);
	}

	public GenericArray<TopItem> getTopNPagesByLikes(int count) {
		Set<Tuple> topSourcesTuple = facebookDao.getTopNPagesByLikes(uuid, count);
		TopItem[] topNPagesArray = topSourcesTuple.stream()
				.map(source -> new TopItem(facebookDao.getPageDetails(uuid, source.getElement()), new Double(source.getScore()).intValue()))
				.collect(Collectors.toList()).toArray(new TopItem[]{});
		return new GenericArray<TopItem>(topNPagesArray);
	}


}


