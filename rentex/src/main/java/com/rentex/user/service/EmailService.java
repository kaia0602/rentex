package com.rentex.user.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender emailSender;

    public void sendHtmlMessage(String to, String subject, String htmlContent) {
        MimeMessage mimeMessage = emailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);

            helper.setText(htmlContent, true);

            emailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("HTML 이메일 발송에 실패했습니다.", e);
        }
    }

}