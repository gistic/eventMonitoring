package org.gistic.tweetboard.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.gistic.tweetboard.representations.Email;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

public class EmailMapper implements ResultSetMapper<Email>{
	
	@Override
	public Email map(int index, ResultSet result, StatementContext cntx) throws SQLException {
		
		return new Email(result.getInt("email_id"), result.getString("first_name"), result.getString("last_name"), result.getString("email"));
	}
}