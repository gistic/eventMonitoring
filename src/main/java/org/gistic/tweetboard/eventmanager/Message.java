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
    }
}
