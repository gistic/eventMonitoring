package org.gistic.tweetboard.datalogic;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.gistic.tweetboard.dao.JdbiSingleton;
import org.gistic.tweetboard.dao.KeywordsDao;
import org.gistic.tweetboard.representations.Keyword;

public class KeywordsDataLogic {
	
	private KeywordsDao keywordsDao;
	
	public KeywordsDataLogic() {
		this.keywordsDao = JdbiSingleton.getInstance().onDemand(KeywordsDao.class);
	}
	
	public boolean createKeyword(String keywordString, String[] relatedWordsStringArray){
		
		try {
			keywordsDao.createNewKeyword(keywordString, String.join(",", relatedWordsStringArray));
			return true;
		} catch (Exception e) {
			return false; // errors while creating
		}
	}
	
	public boolean removeRegisteredEmails(int keyword_id){
		try {
			keywordsDao.removeRegisteredEmails(keyword_id);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	
	public boolean setRegisteredEmails(int keyword_id, int email_id){
		try {
			keywordsDao.setRegisteredEmails(keyword_id, email_id);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	public boolean deleteKeyword(int keyword){
		try {
			keywordsDao.deleteKeyword(keyword);
			return true;
		} catch (Exception e) {
			return false; // errors while creating
		}
		
	}
	
	public List<Keyword> getKeywords(){
		return keywordsDao.getKeywords();
	}
	
	public int getKeywordPeriod(int keyword_id){
		return keywordsDao.getKeywordPeriod(keyword_id)	;
	}
	
	public List<Integer> getKeywordEmails(int keyword_id){
		return keywordsDao.getRegisteredEmails(keyword_id);
	}
	
	public ArrayList<String> getRelatedWords(String[] keywords){
		ArrayList<String> newKeywords = new ArrayList<String>();
		
		List<Keyword> systemKeywords = keywordsDao.getKeywords();
		
		boolean keywordFound;
		
		for (String keyword : keywords) {
			keywordFound = false;
			for (Keyword defienedKeyword : systemKeywords) {
				if(keyword.equals(defienedKeyword.getKeyword())){
					String relatedWords = keywordsDao.getRelatedWord(defienedKeyword.getKeyword());
					List<String> temp = Arrays.asList(relatedWords.split(","));
					newKeywords.addAll(temp);
					keywordFound = true;
					break; // break because it found and we are sure that no duplicates in keywords
				}
			}
			if(!keywordFound){ // it's not a predefined keyword in the system, so add as it is
				newKeywords.add(keyword);
			}
		}
		
		return newKeywords;
	}
	
	public boolean updateKeywordPeriod(int period, int keyword_id){
		try {
			keywordsDao.updateKeywordPeriod(period, keyword_id);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	
	public boolean createEventKeyword(int keyword_id, String event_id){
		try {
			keywordsDao.createEventKeyword(keyword_id, event_id);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	
	public boolean deleteEventKeyword(String event_id){
		try {
			keywordsDao.deleteEventKeyword(event_id);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	
	public static void main(String[] args) {
		KeywordsDataLogic kdl = new KeywordsDataLogic();
		List<Keyword> l = kdl.getKeywords();
		for (Keyword keyword : l) {
			System.out.println(keyword.getKeyword());
			System.out.println(keyword.getRelatedWords());
		}
		
	}
}
