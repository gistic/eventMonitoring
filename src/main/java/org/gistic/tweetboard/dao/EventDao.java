package org.gistic.tweetboard.dao;

import org.gistic.tweetboard.representations.Event;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.SqlQuery;

/**
 * Created by sohussain on 4/5/15.
 */
public interface EventDao {
    @SqlQuery("select * from Event where eventId = :eventId")
    Event getContactById(@Bind("eventId") String eventId);
}
