package com.rentex.user.controller;

import com.rentex.global.jwt.JwtTokenProvider;
import com.rentex.user.domain.User;
import com.rentex.user.dto.LoginRequestDTO;
import com.rentex.user.dto.LoginResponseDTO;
import com.rentex.user.dto.SignUpRequestDTO;
import com.rentex.user.service.EmailService;
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
<<<<<<< HEAD
import org.springframework.security.core.GrantedAuthority;
=======
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
>>>>>>> origin/feature/rentaladd
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
<<<<<<< HEAD
    private final EmailService emailService;
=======
    private final PasswordEncoder passwordEncoder; // ✅ 추가
>>>>>>> origin/feature/rentaladd

    /**
     * 회원가입: 회원 생성 후 이메일 인증 메일 발송
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpRequestDTO req) {
        try {
            userService.signUp(req);
            return ResponseEntity.ok("회원가입 성공! 이메일 인증을 완료해주세요.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("회원가입 중 오류가 발생했습니다.");
        }
    }

    /**
     * 이메일 인증: 토큰 검증 후 사용자 계정 활성화
     */
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
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
            return ResponseEntity.status(500).body("이메일 인증 중 오류가 발생했습니다.");
        }
    }

    /**
     * 로그인: 이메일/비번 인증 → 액세스 토큰 발급 + 리프레시 쿠키 저장
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO req, HttpServletResponse res) {
        try {
<<<<<<< HEAD

            // 이메일 인증 상태 확인
            User user = userService.findByEmail(req.getEmail())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            if (user.getStatus() != User.UserStatus.ACTIVE) {
                log.warn("로그인 실패: 이메일 미인증 사용자. 이메일: {}", req.getEmail());
                return ResponseEntity.status(401).body("로그인 실패: 이메일 인증이 필요합니다.");
            }

            // 1) 스프링 시큐리티로 인증 시도
=======
            // 🔍 디버깅 로그 추가
            var userOpt = userService.findByEmail(req.getEmail());
            if (userOpt.isPresent()) {
                var u = userOpt.get();
                log.info("로그인 시도: email={}", req.getEmail());
                log.info("입력 pw={}, DB pw={}", req.getPassword(), u.getPassword());
                log.info("matches={}", passwordEncoder.matches(req.getPassword(), u.getPassword()));
            } else {
                log.warn("해당 이메일 유저 없음: {}", req.getEmail());
            }

            // 1) 인증
>>>>>>> origin/feature/rentaladd
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

<<<<<<< HEAD
            // 2) Access Token 발급 (DB의 최신 Role 사용)
            String authorities = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));

            String accessToken = jwtTokenProvider.createAccessToken(user.getId(), authorities);

            // 3) Refresh Token 발급 (보안을 위해 권한 미포함)
            String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

            // 토큰 테스트용
            log.info("⭐ [로그인 성공] 발급된 Access Token: {}", accessToken);
            log.info("⭐ [로그인 성공] 발급된 Refresh Token: {}", refreshToken);

            // 4) 리프레시 토큰을 HttpOnly 쿠키에 저장
            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, refreshToken)
                    .httpOnly(true)
                    .secure(true) // 운영 환경에서는 true 권장
=======
            // 2) 이메일 추출 후 유저 조회
            String email = ((UserDetails) auth.getPrincipal()).getUsername();
            var user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

            // 3) 액세스/리프레시 발급 (ROLE 반영)
            String access = jwtTokenProvider.createAccessTokenByUserId(user.getId(), user.getRole());
            String refresh = jwtTokenProvider.createRefreshToken(user.getId());

            // 4) 리프레시 → HttpOnly 쿠키
            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, refresh)
                    .httpOnly(true)
                    .secure(false)
>>>>>>> origin/feature/rentaladd
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(60L * 60L * 24L * 14L)
                    .build();
            res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

<<<<<<< HEAD
            // 5) 액세스 토큰을 헤더와 바디 둘 다로 반환
            LoginResponseDTO responseBody = new LoginResponseDTO(accessToken, user.getId(), user.getName(), user.getRole());
=======
            // 5) 액세스 토큰 헤더/바디 동시 반환
>>>>>>> origin/feature/rentaladd
            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .body(responseBody);

        } catch (Exception e) {
<<<<<<< HEAD
            // 예외 발생 시, 전체 스택 트레이스를 로그로 남겨 원인 파악을 용이하게 합니다.
            log.error("로그인 처리 중 예외 발생", e);
            return ResponseEntity.status(401).body("로그인 실패: " + e.getMessage());
        }
    }

    /**
     * 액세스 토큰 재발급: 리프레시 쿠키 검증 → 새 액세스/리프레시 발급
     */
=======
            log.error("로그인 실패", e); // 전체 스택도 찍어보기
            return ResponseEntity.status(401).body(Map.of("message", "로그인 실패: " + e.getMessage()));
        }
    }


    /** 액세스 토큰 재발급: 리프레시 쿠키 검증 → 새 액세스/리프레시 발급 */
>>>>>>> origin/feature/rentaladd
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(value = REFRESH_COOKIE, required = false) String refreshCookie,
            HttpServletResponse res
    ) {
        try {
            if (refreshCookie == null) {
                return ResponseEntity.status(401).body(Map.of("message", "리프레시 토큰 없음"));
            }

            if (!jwtTokenProvider.validateToken(refreshCookie)) {
                return ResponseEntity.status(401).body(Map.of("message", "리프레시 토큰 무효"));
            }

            Long userId = jwtTokenProvider.getUserIdFromToken(refreshCookie);
<<<<<<< HEAD
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

            if (user.getStatus() != User.UserStatus.ACTIVE) {
                return ResponseEntity.status(401).body(Map.of("message", "계정이 비활성화되어 리프레시할 수 없습니다."));
            }

            // 1) 새 Access Token 발급
            String authorities = "ROLE_" + user.getRole();
            String newAccessToken = jwtTokenProvider.createAccessToken(user.getId(), authorities);

            // 2) 새 Refresh Token 발급
            String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getId());

            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, newRefreshToken)
                    .httpOnly(true).secure(true).sameSite("Lax").path("/").maxAge(60L * 60L * 24L * 14L).build();
=======
            var user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

            // 새 액세스(ROLE 반영)
            String newAccess = jwtTokenProvider.createAccessTokenByUserId(user.getId(), user.getRole());

            // (선택) 리프레시 회전
            String newRefresh = jwtTokenProvider.createRefreshToken(user.getId());
            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, newRefresh)
                    .httpOnly(true).secure(false).sameSite("Lax").path("/").maxAge(60L*60L*24L*14L).build();
>>>>>>> origin/feature/rentaladd
            res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + newAccessToken)
                    .body(Map.of("accessToken", newAccessToken));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "재발급 실패: " + e.getMessage()));
        }
    }

    /**
     * 로그아웃: 리프레시 쿠키 제거(만료)
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res) {
        ResponseCookie delete = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true).secure(true).sameSite("Lax").path("/").maxAge(0).build();
        res.addHeader(HttpHeaders.SET_COOKIE, delete.toString());
        return ResponseEntity.ok().build();
    }
}
