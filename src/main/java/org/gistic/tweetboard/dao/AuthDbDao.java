package org.gistic.tweetboard.dao;

import org.gistic.tweetboard.representations.UserSignupDetails;
import org.postgresql.util.PSQLException;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;

import java.sql.SQLException;

/**
 * Created by osama-hussain on 5/11/16.
 */
public interface AuthDbDao {

    @SqlUpdate("INSERT INTO public.user(\"twitterId\", \"twitterHandle\", \"email\", \"firstName\", \"lastName\") VALUES(:twitterId, :twitterHandle, :email, :firstName, :lastName)")
    void addNewUser(@BindBean UserSignupDetails userSignupDetails);

    @SqlQuery("SELECT COUNT(*) FROM public.user WHERE \"twitterId\" = ':userIdFromTwitter'")
    int isTwitterIdRegistered(@Bind String userIdFromTwitter);
}
