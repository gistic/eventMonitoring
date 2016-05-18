package org.gistic.tweetboard.dao;

import org.gistic.tweetboard.representations.EventConfig;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;

/**
 * Created by osama-hussain on 5/12/16.
 */
public class EventConfigMapper implements ResultSetMapper<EventConfig> {
    @Override
    public EventConfig map(int i, ResultSet r, StatementContext statementContext) throws SQLException {
        EventConfig eventConfig = new EventConfig();
        eventConfig.setBackgroundColor(r.getString("bg_colour"));
        //eventConfig.setHashtags(getStringArray(r.getString("hashtags_j_array")));
        eventConfig.setModerated(Boolean.getBoolean(r.getString("moderated")));
        //eventConfig.setRetweetEnabled(r.getString(""));
        eventConfig.setScreens(getStringArray(r.getString("screens_j_array")));
        int[] screenTimes = getIntsArray(r.getString("screen_time_j_array"));
        eventConfig.setScreenTimes(screenTimes);
        eventConfig.setSize(r.getString("screen_size"));
        return  eventConfig;
        //return new UEventConfigser(r.getLong("user_id"), r.getString("access_token"), r.getString("access_token_secret"));

    }

    private int[] getIntsArray(String screenTimesStr) {
        return Arrays.stream(screenTimesStr.substring(1, screenTimesStr.length()-1).split(","))
                .map(String::trim).mapToInt(Integer::parseInt).toArray();
    }

    private String[] getStringArray(String arrayAsString) {
        Object[] objectHashtagsArray =
                Arrays
                        .stream(arrayAsString.substring(1, arrayAsString.length() - 1).split(","))
                        .map(String::trim)
                        .toArray();
        return Arrays.copyOf(objectHashtagsArray, objectHashtagsArray.length, String[].class);
    }
}
