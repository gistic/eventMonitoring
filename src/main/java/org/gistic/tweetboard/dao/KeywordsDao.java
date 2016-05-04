package org.gistic.tweetboard.dao;

import java.util.List;

import org.gistic.tweetboard.mappers.KeywordMapper;
import org.gistic.tweetboard.representations.Keyword;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.customizers.Mapper;

public interface KeywordsDao {
	
	  @SqlQuery("SELECT * FROM keywords;")
	  @Mapper(KeywordMapper.class)
	  List<Keyword> getKeywords();
	  
	  @SqlQuery("SELECT related_words FROM keywords WHERE keyword=:keyword;")
	  String getRelatedWord(@Bind("keyword") String keyword);
	  
	  @SqlQuery("SELECT email_id FROM emails_keywords WHERE keyword_id=:keyword_id;")
	  List<Integer> getRegisteredEmails(@Bind("keyword_id") int keyword_id);
	  
	  @SqlQuery("SELECT period FROM keywords WHERE keyword_id=:keyword_id;")
	  int getKeywordPeriod(@Bind("keyword_id") int keyword_id);
  	
	  @SqlUpdate("DELETE FROM emails_keywords WHERE keyword_id=:keyword_id")
	  void removeRegisteredEmails(@Bind("keyword_id") int keyword_id);

	  @SqlUpdate("INSERT INTO emails_keywords (keyword_id, email_id) values (:keyword_id, :email_id)")
	  void setRegisteredEmails(@Bind("keyword_id") int keyword_id, @Bind("email_id") int email_id);

	  @SqlUpdate("INSERT INTO keywords (keyword, related_words) values (:keyword, :related_words)")
	  void createNewKeyword(@Bind("keyword") String keyword, @Bind("related_words") String related_words);
	  
	  @SqlUpdate("UPDATE keywords SET keyword=:keyword, related_words=:related_words WHERE keyword_id=:keyword_id")
	  void updateKeyword(@Bind("keyword") String keyword, @Bind("related_words") String related_words, @Bind("keyword_id") int keyword_id);

	  @SqlUpdate("UPDATE keywords SET period=:period WHERE keyword_id=:keyword_id")
	  void updateKeywordPeriod(@Bind("period") int period, @Bind("keyword_id") int keyword_id);

	  @SqlUpdate("DELETE FROM keywords WHERE keyword_id=:keyword_id")
	  void deleteKeyword(@Bind("keyword_id") int keyword_id);
	  
	  @SqlUpdate("INSERT INTO events_keywords (keyword_id, event_id) values (:keyword_id, :event_id)")
	  void createEventKeyword(@Bind("keyword_id") int keyword_id, @Bind("event_id") String event_id);
	  
	  @SqlUpdate("DELETE FROM events_keywords WHERE event_id=:event_id")
	  void deleteEventKeyword(@Bind("event_id") String event_id);
}
