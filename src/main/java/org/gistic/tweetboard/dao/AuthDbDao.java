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

    @SqlQuery("SELECT COUNT(*) FROM public.user WHERE \"twitterId\" = :userIdFromTwitter")
    int isTwitterIdRegistered(@Bind("userIdFromTwitter") String userIdFromTwitter);

    @SqlQuery("SELECT COUNT(*) FROM public.email_activation WHERE email = :email AND code = :code")
    int checkEmailActivationCode(@Bind("email") String email, @Bind("code") String code);

    @SqlUpdate("DELETE FROM public.email_activation WHERE email = :email")
    void deleteAllActivationCodes(@Bind("email") String email);

    @SqlUpdate("INSERT INTO public.email_activation(email, code) VALUES(:email, :code)")
    void storeEmailActivationCode(@Bind("email") String email, @Bind("code") String code);

    @SqlUpdate("UPDATE public.user SET active = TRUE WHERE email = :email")
    void activateAccount(@Bind("email") String email);

    @SqlUpdate("INSERT INTO public.user_events(twitter_user_id, uuid) VALUES(:twitter_user_id, :uuid)")
    static void addToUserEventsList(@Bind("uuid") String uuid, @Bind("twitter_user_id") String twitterUserID) {
    }

    @SqlUpdate("DELETE FROM public.user_events WHERE uuid = :uuid AND twitter_user_id = :twitter_user_id")
    static void removeFromUserEventsList(@Bind("uuid") String uuid, @Bind("twitter_user_id") String twitterUserID) {
    }
}
