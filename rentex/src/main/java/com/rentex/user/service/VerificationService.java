package com.rentex.user.service;


import com.rentex.user.repository.UserRepository;
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final Map<String, VerificationInfo> verificationCodes = new ConcurrentHashMap<>();

    public void generateAndSendCode(String email) {
        // ✅ 사용자가 소셜 로그인 유저인지 먼저 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        if ("SOCIAL_LOGIN_PASSWORD".equals(user.getPassword())) {
            throw new IllegalArgumentException("소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.");
        }

        Random random = new Random();
        String code = String.format("%04d", random.nextInt(10000));
        LocalDateTime expirationTime = LocalDateTime.now().plusSeconds(150);

        verificationCodes.put(email, new VerificationInfo(code, expirationTime));

        // ✅ HTML 템플릿 생성 메서드를 호출하여 내용을 만듭니다.
        String htmlContent = createPasswordResetEmailTemplate(code);

        // ✅ 생성된 HTML 내용을 이메일로 발송합니다.
        emailService.sendHtmlMessage(
                email,
                "[Rentex] 비밀번호 재설정 인증 코드입니다.",
                htmlContent
        );
    }

    public boolean verifyCode(String email, String code) {
        VerificationInfo info = verificationCodes.get(email);

        if (info == null) {
            return false;
        }

        if (LocalDateTime.now().isAfter(info.getExpirationTime())) {
            verificationCodes.remove(email);
            return false;
        }

        if (info.getCode().equals(code)) {
            verificationCodes.remove(email);
            return true;
        }

        return false;
    }

    private String createPasswordResetEmailTemplate(String code) {
        // ✅ 모든 스타일을 각 태그에 직접 적용하는 '인라인 스타일' 방식으로 변경
        String htmlTemplate =
                "<!DOCTYPE html>" +
                        "<html lang='ko'>" +
                        "<head>" +
                        "<meta charset='UTF-8'>" +
                        "</head>" +
                        "<body style=\"font-family: 'Apple SD Gothic Neo', 'sans-serif' !important;\">" +
                        "  <div style=\"max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);\">" +
                        "    <div style=\"font-size: 24px; font-weight: bold; color: #333; text-align: center; margin-bottom: 20px;\">Rentex 비밀번호 재설정</div>" +
                        "    <div style=\"font-size: 16px; color: #555; line-height: 1.6;\">" +
                        "      <p>요청하신 비밀번호 재설정을 위한 인증 코드입니다. 아래 코드를 입력하여 절차를 완료해주세요.</p>" +
                        "      <div style=\"background-color: #f5f5f5; border: 1px solid #eee; padding: 20px; margin: 20px 0; text-align: center;\">" +
                        "        <div style=\"font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px;\">" + code + "</div>" +
                        "      </div>" +
                        "      <p>이 코드는 <strong>2분 30초</strong> 동안 유효합니다.</p>" +
                        "      <p>만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.</p>" +
                        "    </div>" +
                        "    <div style=\"font-size: 12px; color: #999; text-align: center; margin-top: 20px;\">" +
                        "      <p>본 이메일은 발신 전용입니다.</p>" +
                        "      <p>&copy; 2025 Rentex. All Rights Reserved.</p>" +
                        "    </div>" +
                        "  </div>" +
                        "</body>" +
                        "</html>";

        return htmlTemplate;
    }

    @Getter
    private static class VerificationInfo {
        private final String code;
        private final LocalDateTime expirationTime;

        public VerificationInfo(String code, LocalDateTime expirationTime) {
            this.code = code;
            this.expirationTime = expirationTime;
        }
    }
}