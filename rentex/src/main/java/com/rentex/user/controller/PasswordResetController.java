package com.rentex.user.controller;

import com.rentex.user.service.UserService;
import com.rentex.user.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/password-reset")
@RequiredArgsConstructor
public class PasswordResetController {

    private final VerificationService verificationService;
    private final UserService userService;

    // 1. 인증 코드 발송 요청
    @PostMapping("/request")
    public ResponseEntity<String> requestPasswordReset(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        verificationService.generateAndSendCode(email);
        return ResponseEntity.ok("인증 코드가 이메일로 발송되었습니다.");
    }

    // 2. 코드 검증 및 비밀번호 변경
    @PostMapping("/verify")
    public ResponseEntity<String> verifyCodeAndResetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");
        String newPassword = payload.get("newPassword");

        if (verificationService.verifyCode(email, code)) {
            userService.resetPassword(email, newPassword);
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("인증 코드가 유효하지 않습니다.");
        }
    }

    // 3. 구비밀번호와 신비밀번호가 같을 시 나타나는 에러코드를 캐치
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}