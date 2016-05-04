package org.gistic.tweetboard.representations;

public class Keyword {
	private int keywordId;
	private String keyword;
	private String relatedWords;
	public String getKeyword() {
		return keyword;
	}
	
	public Keyword(int keyword_id, String keyword, String relatedWords){
		this.keywordId = keyword_id;
		this.keyword = keyword;
		this.relatedWords = relatedWords;
	}
	
	public int getKeywordId() {
		return keywordId;
	}

	public void setKeywordId(int keyword_id) {
		this.keywordId = keyword_id;
	}

	public void setKeyword(String keyword){
		this.keyword = keyword;
	}
	public String getRelatedWords(){
		return relatedWords;
	}
	public void setRelatedWords(String relatedWords){
		this.relatedWords = relatedWords;
	}
	
}
