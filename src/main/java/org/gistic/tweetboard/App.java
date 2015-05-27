package org.gistic.tweetboard;


import com.bendb.dropwizard.redis.JedisBundle;
import com.bendb.dropwizard.redis.JedisFactory;
import io.dropwizard.Application;
import io.dropwizard.auth.AuthFactory;
import io.dropwizard.bundles.assets.ConfiguredAssetsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import org.gistic.tweetboard.eventmanager.EventMap;
import org.gistic.tweetboard.eventmanager.ExecutorSingleton;
import org.gistic.tweetboard.resources.AdminEventSource;
import org.gistic.tweetboard.resources.EventsResource;
import org.gistic.tweetboard.resources.LiveTweetsBroadcaster;
import org.gistic.tweetboard.resources.LoginResource;
import org.gistic.tweetboard.security.TwitterAuthFactory;
import org.gistic.tweetboard.security.TwitterAuthenticator;
import org.gistic.tweetboard.security.User;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.JedisPool;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.TimeUnit;


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
        e.jersey().register(AuthFactory.binder(new TwitterAuthFactory<User>(new TwitterAuthenticator(),
                User.class)));
        e.jersey().register(MultiPartFeature.class);
        e.jersey().register(new EventsResource());
        e.jersey().register(new LiveTweetsBroadcaster());
        e.jersey().register(new AdminEventSource());
        e.jersey().register(new LoginResource());
        e.getApplicationContext().addServlet("org.gistic.tweetboard.resources.SseResource", "/api/adminLiveTweets");
        DelayedJobsManager.initiate();
        //e.getApplicationContext().addServlet("org.gistic.tweetboard.resources.LiveTweetsServlet", "/api/liveTweets");
        //Close threads on JVM exit
        Runtime.getRuntime().addShutdownHook(new Thread() {
            public void run() {
                DelayedJobsManager.destroy();

                LoggerFactory.getLogger(this.getClass()).info("Shutting down threads");
                ExecutorService executor = ExecutorSingleton.getInstance();
                executor.shutdown();
                try {
                    if (!executor.awaitTermination(15, TimeUnit.SECONDS)) { //optional *
                        LoggerFactory.getLogger(this.getClass()).error("Executor did not terminate in the specified time."); //optional *
                        List<Runnable> droppedTasks = executor.shutdownNow(); //optional **
                        LoggerFactory.getLogger(this.getClass()).error("Executor was abruptly shut down. " + droppedTasks.size() + " tasks will not be executed."); //optional **
                    }
                } catch (InterruptedException e1) {
                    e1.printStackTrace();
                }
            }
        });
    }
}
