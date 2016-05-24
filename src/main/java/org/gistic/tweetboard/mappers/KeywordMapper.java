package org.gistic.tweetboard.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.gistic.tweetboard.representations.Keyword;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

public class KeywordMapper implements ResultSetMapper<Keyword>{
	
	@Override
	public Keyword map(int index, ResultSet result, StatementContext cntx) throws SQLException {
		
		return new Keyword(result.getInt("keyword_id"), result.getString("keyword"), result.getString("related_words"));
	}

}
