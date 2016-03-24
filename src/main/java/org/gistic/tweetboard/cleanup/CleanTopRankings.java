package org.gistic.tweetboard.cleanup;

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
            try {
                Thread.sleep(60000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
