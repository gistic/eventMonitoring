package org.gistic.tweetboard.cleanup;

import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.eventmanager.EventMap;

/**
 * Created by osama-hussain on 3/24/16.
 */
public class CleanTopRankings implements Runnable{
    public void run() {
        while(true) {
            EventMap.CleanupTopRankings();

            System.out.println("#############");
            System.out.println("CLEANED UP!!!");
            System.out.println("#############");
            int timeout = ConfigurationSingleton.getInstance().getCleanUpIntervalInSecs();
            try {
                Thread.sleep(timeout*1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
