package org.gistic.tweetboard;

/**
 * Created by sohussain on 4/12/15.
 */
public class ConfigurationSingleton {
    private static TweetBoardConfiguration instance = null;
    protected ConfigurationSingleton() {
        // Exists only to defeat instantiation.
    }
    public static TweetBoardConfiguration getInstance() {
        return instance;
    }
    public static void setInstance(TweetBoardConfiguration instance) {
        if(instance == null) {
            throw new IllegalArgumentException();
        }
        ConfigurationSingleton.instance = instance;
    }
}
