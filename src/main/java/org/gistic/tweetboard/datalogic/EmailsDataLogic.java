package org.gistic.tweetboard.datalogic;

import java.util.List;

import org.gistic.tweetboard.dao.EmailDao;
import org.gistic.tweetboard.dao.FacebookPagesDao;
import org.gistic.tweetboard.representations.Email;
import org.gistic.tweetboard.representations.FacebookPage;

public class EmailsDataLogic {

private EmailDao emailDao;
	
	public EmailsDataLogic(EmailDao emailDao) {
		this.emailDao = emailDao;
	}
	
	public boolean createEmail(String FirstName, String lastName, String pageScreenName){
		try {
			emailDao.createNewEmail(FirstName, lastName, pageScreenName);
			return true;
		} catch (Exception e) {
			return false; // errors while creating
		}
		
	}
	
	public boolean deleteEmail(int email_id){
		try {
			 emailDao.deleteEmail(email_id);
			 return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false; // errors while deleting
		}
	}
	
	public List<Email> getEmails(){
		return emailDao.getEmails();
	}
}
