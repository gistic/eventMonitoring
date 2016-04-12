package org.gistic.tweetboard.datalogic;

import org.gistic.tweetboard.dao.FacebookPagesDao;
import org.gistic.tweetboard.representations.FacebookPage;

public class FacebookPagesDataLogic {

	private FacebookPagesDao facebookPagesDao;
	
	public FacebookPagesDataLogic(FacebookPagesDao facebookPagesDao) {
		this.facebookPagesDao = facebookPagesDao;
	}
	
	public boolean createFacebookPage(String pageName, String pageScreenName){
		return facebookPagesDao.createFacebookpage(pageName, pageScreenName);
	}
	
	public boolean deleteFacebookPage(String pageName){
		return facebookPagesDao.deleteFacebookPage(pageName);
	}
	
	public FacebookPage[] getFacebookPages(){
		return facebookPagesDao.getFacebookPages();
	}

}
