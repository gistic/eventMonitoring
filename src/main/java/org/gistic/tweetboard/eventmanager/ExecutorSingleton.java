package org.gistic.tweetboard.eventmanager;

import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Created by sohussain on 4/7/15.
 */
public class ExecutorSingleton {
    private static ExecutorService executor = null;
    private ExecutorSingleton() {
        // Exists only to defeat instantiation.
    }
    public static ExecutorService getInstance() {
        if(executor == null) {
            executor = Executors.newCachedThreadPool();
        }
        return executor;
    }
}
