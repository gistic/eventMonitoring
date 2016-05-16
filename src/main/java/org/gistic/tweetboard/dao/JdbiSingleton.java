package org.gistic.tweetboard.dao;

import org.skife.jdbi.v2.DBI;
/**
 * Created by osama-hussain on 5/11/16.
 */
public class JdbiSingleton {
    private static DBI instance = null;
    protected JdbiSingleton() {
        // Exists only to defeat instantiation.
    }
    public static DBI getInstance() {
        return instance;
    }
    public static void setInstance(DBI instance) {
        if(instance == null) {
            throw new IllegalArgumentException();
        }
        JdbiSingleton.instance = instance;
    }
}