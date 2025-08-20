package com.rentex.user.controller;

import com.rentex.global.jwt.JwtTokenProvider;
import com.rentex.user.domain.User;
import com.rentex.user.dto.LoginRequestDTO;
import com.rentex.user.dto.LoginResponseDTO;
import com.rentex.user.dto.SignUpRequestDTO;
import com.rentex.user.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    /**
     * 회원가입: 회원 생성 후 이메일 인증 메일 발송
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpRequestDTO req) {
        try {
            userService.signUp(req);
            return ResponseEntity.ok(Map.of("message", "회원가입 성공! 이메일 인증을 완료해주세요."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("회원가입 처리 중 예외 발생", e);
            return ResponseEntity.status(500).body(Map.of("message", "회원가입 중 오류가 발생했습니다."));
        }
    }

    /**
     * 이메일 인증: 토큰 검증 후 사용자 계정 활성화
     */
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            User user = userService.findByEmailVerificationToken(token)
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest().body("유효하지 않은 토큰입니다.");
            }
            if (user.getTokenExpirationDate().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body("만료된 토큰입니다.");
            }

            userService.activateUser(user);
            return ResponseEntity.ok("이메일 인증이 성공적으로 완료되었습니다. 이제 로그인할 수 있습니다.");

        } catch (Exception e) {
            log.error("이메일 인증 처리 중 예외 발생", e);
            return ResponseEntity.status(500).body("이메일 인증 중 오류가 발생했습니다.");
        }
    }

    /**
     * 로그인: 이메일/비번 인증 → 액세스 토큰 발급 + 리프레시 쿠키 저장
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO req, HttpServletResponse res) {
        try {
            User user = userService.findByEmail(req.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

            if (user.getStatus() != User.UserStatus.ACTIVE) {
                log.warn("로그인 실패: 이메일 미인증 사용자. 이메일: {}", req.getEmail());
                return ResponseEntity.status(401).body(Map.of("message", "로그인 실패: 이메일 인증이 필요합니다."));
            }

            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getRole());
            String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, refreshToken)
                    .httpOnly(true)
                    .secure(true) // HTTPS 환경에서만 전송
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(60L * 60L * 24L * 14L) // 2주
                    .build();
            res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            LoginResponseDTO responseBody = new LoginResponseDTO(accessToken, user.getId(), user.getName(), user.getRole());

            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .body(responseBody);

        } catch (Exception e) {
            log.error("로그인 처리 중 예외 발생", e);
            return ResponseEntity.status(401).body(Map.of("message", "로그인 실패: " + e.getMessage()));
        }
    }

    /**
     * 액세스 토큰 재발급: 리프레시 쿠키 검증 → 새 액세스/리프레시 발급 (Refresh Token Rotation)
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = REFRESH_COOKIE, required = false) String refreshCookie,
                                     HttpServletResponse res) {
        try {
            if (refreshCookie == null) {
                return ResponseEntity.status(401).body(Map.of("message", "리프레시 토큰이 없습니다."));
            }
            if (!jwtTokenProvider.validateToken(refreshCookie)) {
                return ResponseEntity.status(401).body(Map.of("message", "유효하지 않은 리프레시 토큰입니다."));
            }

            Long userId = jwtTokenProvider.getUserIdFromToken(refreshCookie);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));

            if (user.getStatus() != User.UserStatus.ACTIVE) {
                return ResponseEntity.status(401).body(Map.of("message", "계정이 비활성화되어 토큰을 재발급할 수 없습니다."));
            }

            String newAccessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getRole());
            String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getId()); // Refresh Token Rotation

            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, newRefreshToken)
                    .httpOnly(true).secure(true).sameSite("Lax").path("/").maxAge(60L * 60L * 24L * 14L).build();
            res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + newAccessToken)
                    .body(Map.of("accessToken", newAccessToken));

        } catch (Exception e) {
            log.error("토큰 재발급 처리 중 예외 발생", e);
            return ResponseEntity.status(401).body(Map.of("message", "토큰 재발급에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 로그아웃: 리프레시 쿠키 제거(만료)
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res) {
        ResponseCookie deleteCookie = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true).secure(true).sameSite("Lax").path("/").maxAge(0).build();
        res.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        return ResponseEntity.ok().build();
    }
}