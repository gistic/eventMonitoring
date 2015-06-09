package org.gistic.tweetboard.security;

import com.google.common.base.Optional;
import io.dropwizard.auth.*;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.InternalServerErrorException;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;

/**
 * Created by osama-hussain on 5/27/15.
 */
public class TwitterAuthFactory<T> extends AuthFactory<TwitterCredentials, T> {

    @Context
    private HttpServletRequest request;

    private UnauthorizedHandler unauthorizedHandler = new DefaultUnauthorizedHandler();
    private final Class<T> generatedClass;
    private final boolean required;

    public TwitterAuthFactory(Authenticator<TwitterCredentials, T> authenticator, Class<T> generatedClass) {
        super(authenticator);
        this.required = false;
        this.generatedClass = generatedClass;
    }

    public TwitterAuthFactory(boolean required, Authenticator<TwitterCredentials, T> authenticator, Class<T> generatedClass) {
        super(authenticator);
        this.required = required;
        this.generatedClass = generatedClass;
    }

    @Override
    public void setRequest(HttpServletRequest httpServletRequest) {
        this.request = httpServletRequest;
    }

    @Override
    public AuthFactory<TwitterCredentials, T> clone(boolean required) {
        return new TwitterAuthFactory<>(required, authenticator(), this.generatedClass).responseBuilder(unauthorizedHandler);
    }

    public TwitterAuthFactory<T> responseBuilder(UnauthorizedHandler unauthorizedHandler) {
        this.unauthorizedHandler = unauthorizedHandler;
        return this;
    }

    @Override
    public Class<T> getGeneratedClass() {
        return generatedClass;
    }

    @Override
    public T provide() {
        if (request != null) {
            final String token = request.getParameter("authToken");
            //if (token != null && !token.isEmpty()) {
                final TwitterCredentials credentials = new TwitterCredentials(token);
                final Optional<T> result;
                try {
                    result = authenticator().authenticate(credentials);
                } catch (AuthenticationException e) {
//                    e.printStackTrace();
                    LoggerFactory.getLogger(this.getClass()).warn("Error authenticating credentials");
                    throw new InternalServerErrorException();
                }
                if (result.isPresent()) {
                    return result.get();
                }
            //}
        }
        if (required) {
            //TODO
            throw new WebApplicationException(unauthorizedHandler.buildResponse("", ""));
        }
        return null;
    }
}
