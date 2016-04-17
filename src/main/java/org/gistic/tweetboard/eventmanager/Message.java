package org.gistic.tweetboard.eventmanager;

/**
 * Created by osama-hussain on 5/4/15.
 */
public class Message {

    String msg;
    String uuid;

    public Message(String uuid, String type, String msg) {
        this.uuid = uuid;
        this.type = type;
        this.msg = msg;
    }

    public Message() {}

    String type;



    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
    public class Type {
        public static final String LiveTweet = "liveTweet";
        public static final String UiUpdate = "uiUpdate";
        public static final String TweetsOverTime = "tweetsOverTime";

        public static final String CountryUpdate = "countryUpdate";
        public static final String TopPeople = "topPeople";
		public static final String NewsItem = "newsItem";
		public static final String FbPost = "fbPost";

        public static final String TopFacebookPages = "topFbPages";

        public static final String TopFacebookPagesByShares = "topFbPagesByShares";

        public static final String TopFacebookPagesByComments = "topFbPagesByComments";

        public static final String TopFacebookPagesByLikes = "topFbPagesByLikes";

    }
}
