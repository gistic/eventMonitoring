package org.gistic.tweetboard.representations;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

public class Email {

	private int email_id;
	private String firstName;
	private String lastName;
	private String email;
	
	public Email(int email_id, String firstName, String lastName, String email) {
		this.email_id = email_id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
	}
	
	
	public int getEmail_id() {
		return email_id;
	}
	public void setEmail_id(int email_id) {
		this.email_id = email_id;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	
}
