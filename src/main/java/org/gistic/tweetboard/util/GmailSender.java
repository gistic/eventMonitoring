package org.gistic.tweetboard.util;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

/**
 * Created by osama-hussain on 5/12/15.
 */
public class GmailSender {
    static Properties mailServerProperties;
    static Session getMailSession;
    static MimeMessage generateMailMessage;
    static final String URL = "http://127.0.0.1:8080";

    static final String subject = "Congratulations! new event created at TweetBoard";

    public static void send(String address, String activationId) throws AddressException, MessagingException {
        generateAndSendEmail(address, activationId);
        //log sedning email
        //System.out.println("\n\n ===> Your Java Program has just sent an Email successfully. Check your email..");
    }

    public static void generateAndSendEmail(String address, String activationId) throws AddressException, MessagingException {
        Logger logger = LoggerFactory.getLogger(GmailSender.class);
        //logger.info("sending email for event: "+uuid+" to address: "+address);
//Step1
        mailServerProperties = System.getProperties();
        mailServerProperties.put("mail.smtp.port", "587");
        mailServerProperties.put("mail.smtp.auth", "true");
        mailServerProperties.put("mail.smtp.starttls.enable", "true");

//Step2
        logger.info("get Mail Session..");
        getMailSession = Session.getDefaultInstance(mailServerProperties, null);
        generateMailMessage = new MimeMessage(getMailSession);
        generateMailMessage.addRecipient(Message.RecipientType.TO, new InternetAddress(address));
        //generateMailMessage.addRecipient(Message.RecipientType.CC, new InternetAddress("test2@crunchify.com"));
        generateMailMessage.setSubject(subject);
        //String emailBody = "Your event has been created. \n\n You can access the admin page at "+URL+"/admin#/admin?uuid="+uuid;
        String emailBody = "Activate your account my clicking on this link "+URL+"/activate/"+activationId;
        generateMailMessage.setContent(emailBody, "text/html");
        logger.info("Mail Session has been created successfully..");

//Step3
        logger.info("Getting Session");
        Transport transport = getMailSession.getTransport("smtp");
        // Enter your correct gmail UserID and Password (XXXApp Shah@gmail.com)
        transport.connect("smtp.gmail.com", "noreply.tweetboard@gmail.com", "draobteewt");
        logger.info("Sending email");
        transport.sendMessage(generateMailMessage, generateMailMessage.getAllRecipients());
        transport.close();
    }
}
