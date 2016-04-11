package org.gistic.tweetboard.datalogic;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.gistic.tweetboard.dao.KeywordsDao;
import org.gistic.tweetboard.representations.Keyword;

public class KeywordsDataLogic {
	
	private KeywordsDao keywordsDao;
	
	public KeywordsDataLogic(KeywordsDao keywordsDao) {
		this.keywordsDao = keywordsDao;
	}
	
	public boolean createKeyword(String keywordString, String[] relatedWordsStringArray){
		return keywordsDao.createKeyword(keywordString, relatedWordsStringArray);
	}
	
	public boolean deleteKeyword(String keyword){
		return keywordsDao.deleteKeyword(keyword);
	}
	
	public Keyword[] getKeywords(){
		return keywordsDao.getKeywords();
	}
	
	public ArrayList<String> getRelatedWords(String[] keywords){
		ArrayList<String> newKeywords = new ArrayList<String>();
		
		Keyword[] systemKeywords = keywordsDao.getKeywords();
		
		boolean keywordFound;
		
		for (String keyword : keywords) {
			keywordFound = false;
			for (Keyword defienedKeyword : systemKeywords) {
				if(keyword.equals(defienedKeyword.getKeyword())){
					List<String> temp = Arrays.asList(defienedKeyword.getRelatedWords());
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
}
