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
            // MimeMessageHelper를 생성할 때, 두 번째 인자를 'true'로 설정해야
            // multipart 메시지(HTML, 첨부파일 등)를 지원합니다.
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);

            // ✅ 핵심: setText 메서드의 두 번째 인자를 'true'로 설정해야 HTML로 인식됩니다.
            helper.setText(htmlContent, true);

            emailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("HTML 이메일 발송에 실패했습니다.", e);
        }
    }
}