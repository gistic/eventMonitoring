package org.gistic.tweetboard;


import com.bendb.dropwizard.redis.JedisBundle;
import com.bendb.dropwizard.redis.JedisFactory;
import io.dropwizard.Application;
import io.dropwizard.bundles.assets.ConfiguredAssetsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import org.gistic.tweetboard.eventmanager.EventMap;
import org.gistic.tweetboard.resources.EventsResource;
import org.gistic.tweetboard.resources.LiveTweetsBroadcaster;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.JedisPool;


/**
 * Main App class, starting point
 */
public class App extends Application<TweetBoardConfiguration> {
    private static final Logger LOGGER =
            LoggerFactory.getLogger(App.class);


    public static void main(String[] args) throws Exception {
        new App().run(args);
    }

    @Override
    public void initialize(Bootstrap<TweetBoardConfiguration> b) {
        b.addBundle(new ConfiguredAssetsBundle("/assets/","/", "index.html"));
        b.addBundle(new JedisBundle<TweetBoardConfiguration>() {
            @Override
            public JedisFactory getJedisFactory(TweetBoardConfiguration configuration) {
                return configuration.getJedisFactory();
            }
        });
    }

    @Override
    public void run(TweetBoardConfiguration c, Environment e) throws Exception {
        LOGGER.info("Method App#run() called");
        ConfigurationSingleton.setInstance(c);
        JedisPool pool = ConfigurationSingleton.getInstance().getJedisFactory().build(e);
        JedisPoolContainer.setInstance(pool);
        EventMap.setTwitterConfiguration(c.getTwitterConfiguration());
        e.jersey().register(new EventsResource());
        e.jersey().register(new LiveTweetsBroadcaster());
        e.getApplicationContext().addServlet("org.gistic.tweetboard.resources.SseResource", "/api/adminLiveTweets");
        //e.getApplicationContext().addServlet("org.gistic.tweetboard.resources.LiveTweetsServlet", "/api/liveTweets");
    }
}
