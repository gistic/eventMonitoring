package org.gistic.tweetboard;

import net.greghaines.jesque.Config;
import net.greghaines.jesque.ConfigBuilder;
import net.greghaines.jesque.Job;
import net.greghaines.jesque.client.Client;
import net.greghaines.jesque.client.ClientImpl;
import net.greghaines.jesque.worker.MapBasedJobFactory;
import net.greghaines.jesque.worker.Worker;
import net.greghaines.jesque.worker.WorkerImpl;
import org.gistic.tweetboard.delayedjob.DestroyEventAction;

import java.util.Arrays;

import static net.greghaines.jesque.utils.JesqueUtils.entry;
import static net.greghaines.jesque.utils.JesqueUtils.map;

/**
 * Created by osama-hussain on 5/13/15.
 */
public class DelayedJobsManager {
    //    static Client client;
    static final String EVENT_DESTROY_QUEUE = "eventDestroyQueue";
    public static final String DESTROY_EVENT_ACTION = "DestroyEventAction";
    static Worker worker;
    static Thread workerThread;
    public static void initiate() {
        final Config config = new ConfigBuilder().build();
        // Start a worker to run jobs from the queue
        worker = new WorkerImpl(config,
                Arrays.asList(EVENT_DESTROY_QUEUE),
                new MapBasedJobFactory(map(entry(DESTROY_EVENT_ACTION, DestroyEventAction.class))));
        workerThread = new Thread(worker);
        workerThread.start();
    }

    public static void createEventDestroyJob(String uuid, String accessToken) {
        final Config config = new ConfigBuilder().build();
        Client client = new ClientImpl(config);
        final long delayInSeconds = ConfigurationSingleton.getInstance().getDefaultAutoShutdownDelayInHours() * 60 * 60; // in seconds
        final long future = System.currentTimeMillis() + (delayInSeconds * 1000);
        // Add a job to the delayed queue
        final Job job = new Job(DESTROY_EVENT_ACTION, new Object[]{ uuid, accessToken });
        client.delayedEnqueue(EVENT_DESTROY_QUEUE, job, future);
        client.end();
    }

    public static void refreshEventDestroyJob(String uuid, String accessToken) {
        final Config config = new ConfigBuilder().build();
        Client client = new ClientImpl(config);
        // Remove old job
        deleteEventDestroyJob(uuid, accessToken);
        // Add a job to the delayed queue
        final long delayInSeconds = ConfigurationSingleton.getInstance().getDefaultAutoShutdownDelayInHours() * 60 * 60;
        final long future = System.currentTimeMillis() + (delayInSeconds * 1000);
        final Job job = new Job(DESTROY_EVENT_ACTION, new Object[]{ uuid, accessToken });
        client.delayedEnqueue(EVENT_DESTROY_QUEUE, job, future);
        client.end();
    }

    public static void deleteEventDestroyJob(String uuid, String accessToken) {
        final Config config = new ConfigBuilder().build();
        Client client = new ClientImpl(config);
        final Job job = new Job(DESTROY_EVENT_ACTION, new Object[]{ uuid, accessToken });
        client.removeDelayedEnqueue(EVENT_DESTROY_QUEUE, job);
    }

    public static void destroy() {
        worker.end(true);
        try { workerThread.join(); } catch (Exception e){ e.printStackTrace(); }
    }
}
