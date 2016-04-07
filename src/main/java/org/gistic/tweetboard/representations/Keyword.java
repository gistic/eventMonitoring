package org.gistic.tweetboard.representations;

public class Keyword {
	private String keyword;
	private String[] relatedWords;
	public String getKeyword() {
		return keyword;
	}
	
	public Keyword(String keyword, String[] relatedWords){
		this.keyword = keyword;
		this.relatedWords = relatedWords;
	}
	
	
	public void setKeyword(String keyword){
		this.keyword = keyword;
	}
	public String[] getRelatedWords(){
		return relatedWords;
	}
	public void setRelatedWords(String[] relatedWords){
		this.relatedWords = relatedWords;
	}
	
}
