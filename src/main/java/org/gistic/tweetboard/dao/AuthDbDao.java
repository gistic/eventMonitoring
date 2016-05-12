package org.gistic.tweetboard.dao;

import org.gistic.tweetboard.representations.EventConfig;
import org.gistic.tweetboard.representations.UserSignupDetails;
import org.postgresql.util.PSQLException;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.customizers.Mapper;

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
    void addToUserEventsList(@Bind("uuid") String uuid, @Bind("twitter_user_id") String twitterUserID);

    @SqlUpdate("DELETE FROM public.user_events WHERE uuid = :uuid AND twitter_user_id = :twitter_user_id")
    void removeFromUserEventsList(@Bind("uuid") String uuid, @Bind("twitter_user_id") String twitterUserID);

    @SqlQuery("select bg_colour, screens_j_array, screen_time_j_array, screen_size, hashtags_j_array, moderated from user_event_defaults where uuid = :uuid limit 1")
    @Mapper(EventConfigMapper.class)
    EventConfig getEventConfig(@Bind("uuid") String uuid);

    @SqlUpdate("INSERT INTO public.user_event_defaults(bg_colour, screens_j_array, screen_time_j_array, screen_size, hashtags_j_array, moderated, uuid) VALUES(:bg_colour, :screens_j_array, :screen_time_j_array, :screen_size, :hashtags_j_array, :moderated, :uuid)")
    void addToEventConfig(@Bind("bg_colour") String bgColour, @Bind("screens_j_array") String screensJArray, @Bind("screen_size") String sceenSize, @Bind("hashtags_j_array") String hashtagsJArray, @Bind("moderated") boolean moderated, @Bind("uuid") String uuid);

    @SqlUpdate("UPDATE public.user_event_defaults SET (bg_colour, screens_j_array, screen_time_j_array, screen_size, hashtags_j_array, moderated) VALUES(:bg_colour, :screens_j_array, :screen_time_j_array, :screen_size, :hashtags_j_array, :moderated) WHERE uuid = :uuid")
    void updateEventConfig(@Bind("bg_colour") String bgColour, @Bind("screens_j_array") String screensJArray, @Bind("screen_size") String sceenSize, @Bind("hashtags_j_array") String hashtagsJArray, @Bind("moderated") boolean moderated, @Bind("uuid") String uuid);

}
