package org.gistic.tweetboard;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.validator.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

/**
 * Created by sohussain on 4/7/15.
 */
public class TwitterConfiguration {
    @NotNull
    @NotEmpty
    @JsonProperty("consumer-key")
    private final String consumerKey = null;

    @NotNull
    @NotEmpty
    @JsonProperty("consumer-secret")
    private final String consumerSecret = null;

    @NotNull
    @NotEmpty
    @JsonProperty("user-key")
    private final String userKey = null;

    @NotNull
    @NotEmpty
    @JsonProperty("user-secret")
    private final String userSecret = null;

    public String getConsumerKey() {
        return consumerKey;
    }

    public String getConsumerSecret() {
        return consumerSecret;
    }

    public String getUserKey() {
        return userKey;
    }

    public String getUserSecret() {
        return userSecret;
    }
}
