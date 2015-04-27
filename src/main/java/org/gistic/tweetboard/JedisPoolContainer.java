package org.gistic.tweetboard;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

/**
 * Created by Osama-GIS on 4/16/2015.
 */
public class JedisPoolContainer {
    private static JedisPool jp = null;
    private JedisPoolContainer() {
        // Exists only to defeat instantiation.
    }
    public static void setInstance(JedisPool jPool) {
        jp = jPool;
    }
    public static Jedis getInstance() {
        return jp.getResource();
    }
}

