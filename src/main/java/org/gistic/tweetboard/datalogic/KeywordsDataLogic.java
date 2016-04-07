package org.gistic.tweetboard.datalogic;

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
}
