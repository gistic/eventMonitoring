package org.gistic.tweetboard;

import com.bendb.dropwizard.redis.JedisFactory;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.Configuration;
import io.dropwizard.bundles.assets.AssetsBundleConfiguration;
import io.dropwizard.bundles.assets.AssetsConfiguration;
import org.hibernate.validator.constraints.NotEmpty;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

/**
 * Created by sohussain on 3/26/15.
 */
public class TweetBoardConfiguration extends Configuration implements AssetsBundleConfiguration {
    @JsonProperty
    @NotEmpty
    private String message;

    @JsonProperty
    private int defaultAutoShutdownDelayInHours;

    public int getDefaultAutoShutdownDelayInHours() {
        return defaultAutoShutdownDelayInHours;
    }

    public void setDefaultAutoShutdownDelayInHours(int defaultAutoShutdownDelayInHours) {
        this.defaultAutoShutdownDelayInHours = defaultAutoShutdownDelayInHours;
    }

    @JsonProperty
    private int messageRepetitions;
    public String getMessage() {
        return message;
    }
    public int getMessageRepetitions() {
        return messageRepetitions;
    }

    @Valid
    @NotNull
    private JedisFactory jedisFactory = new JedisFactory();

    @JsonProperty("redis")
    public JedisFactory getJedisFactory() {
        return jedisFactory;
    }

    @JsonProperty("redis")
    public void setJedisFactory(JedisFactory factory) {
        this.jedisFactory = factory;
        //this.jedisFactory.setEndpoint(new HostAndPort(""));
    }

    @NotNull
    @Valid
    @JsonProperty("twitter")
    private final TwitterConfiguration twitter = null;

    public TwitterConfiguration getTwitterConfiguration() {
        return twitter;
    }

    @Valid
    @NotNull
    @JsonProperty
    private final AssetsConfiguration assets = new AssetsConfiguration();

    @Override
    public AssetsConfiguration getAssetsConfiguration() {
        return assets;
    }

    @JsonProperty
    @NotEmpty
    private boolean v2;

    public boolean isV2() { return v2; }
}
