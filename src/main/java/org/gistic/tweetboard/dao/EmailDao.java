package org.gistic.tweetboard.dao;

import java.util.List;


import org.gistic.tweetboard.mappers.EmailMapper;
import org.gistic.tweetboard.representations.Email;

import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.customizers.Mapper;
import org.skife.jdbi.v2.sqlobject.*;


public interface EmailDao {
		
	  @SqlQuery("SELECT * FROM emails;")
	  @Mapper(EmailMapper.class)
	  List<Email> getEmails();
	  
	  @SqlUpdate("INSERT INTO emails (first_name, last_name, email) values (:first_name, :last_name, :email)")
	  void createNewEmail(@Bind("first_name") String first_name, @Bind("last_name") String last_name, @Bind("email") String email);
	  
	  @SqlUpdate("UPDATE emails SET first_name=:first_name, last_name=:last_name, email=:email WHERE email_id=:email_id")
	  void updateEmail(@Bind("first_name") String first_name, @Bind("last_name") String last_name, @Bind("email") String email, @Bind("email_id") int email_id);

	  @SqlUpdate("DELETE FROM emails WHERE email_id=:email_id")
	  void deleteEmail(@Bind("email_id") int email_id);

	  public static void main(String[] args) {
		  
//		  EmailDao edao = JdbiSingleton.getInstance().onDemand(EmailDao.class);
//		  edao.createNewEmail("test", "test2", "email");
	}
}
