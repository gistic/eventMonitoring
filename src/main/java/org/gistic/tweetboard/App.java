package org.gistic.tweetboard;

import com.bazaarvoice.dropwizard.assets.ConfiguredAssetsBundle;
import com.bendb.dropwizard.redis.JedisBundle;
import com.bendb.dropwizard.redis.JedisFactory;
import com.bendb.dropwizard.redis.JedisPoolManager;
import io.dropwizard.assets.AssetsBundle;
import org.gistic.tweetboard.eventmanager.EventMap;
import org.gistic.tweetboard.resources.EventsResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.dropwizard.Application;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import com.google.common.eventbus.AsyncEventBus;
import com.google.common.eventbus.EventBus;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;


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
        //AssetsBundle assetsBundle = new AssetsBundle("/assets/", "/", "index.html", "static");
        b.addBundle(new ConfiguredAssetsBundle("/assets/","/", "index.html"));
        //b.addBundle(assetsBundle);
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
        e.getApplicationContext().addServlet("org.gistic.tweetboard.resources.SseResource", "/api/adminLiveTweets");
        e.getApplicationContext().addServlet("org.gistic.tweetboard.resources.LiveTweetsServlet", "/api/liveTweets");
        e.jersey().setUrlPattern("/api/*");
    }
}
