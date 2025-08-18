// src/main/java/com/rentex/user/controller/AuthController.java
package com.rentex.user.controller;

import com.rentex.global.jwt.JwtTokenProvider;
import com.rentex.user.dto.LoginRequestDTO;
import com.rentex.user.dto.LoginResponseDTO;
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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
    private final PasswordEncoder passwordEncoder; // ✅ 추가

    /** 로그인: 이메일/비번 인증 → 액세스 토큰 발급 + 리프레시 쿠키 저장 */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO req, HttpServletResponse res) {
        try {
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
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

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
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(60L * 60L * 24L * 14L)
                    .build();
            res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            // 5) 액세스 토큰 헤더/바디 동시 반환
            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + access)
                    .body(new LoginResponseDTO(access, user.getId(), user.getName(), user.getRole()));

        } catch (Exception e) {
            log.error("로그인 실패", e); // 전체 스택도 찍어보기
            return ResponseEntity.status(401).body(Map.of("message", "로그인 실패: " + e.getMessage()));
        }
    }


    /** 액세스 토큰 재발급: 리프레시 쿠키 검증 → 새 액세스/리프레시 발급 */
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
            var user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

            // 새 액세스(ROLE 반영)
            String newAccess = jwtTokenProvider.createAccessTokenByUserId(user.getId(), user.getRole());

            // (선택) 리프레시 회전
            String newRefresh = jwtTokenProvider.createRefreshToken(user.getId());
            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, newRefresh)
                    .httpOnly(true).secure(false).sameSite("Lax").path("/").maxAge(60L*60L*24L*14L).build();
            res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + newAccess)
                    .body(Map.of("accessToken", newAccess));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "재발급 실패: " + e.getMessage()));
        }
    }

    /** 로그아웃: 리프레시 쿠키 제거(만료) */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res) {
        ResponseCookie delete = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true).secure(false).sameSite("Lax").path("/").maxAge(0).build();
        res.addHeader(HttpHeaders.SET_COOKIE, delete.toString());
        return ResponseEntity.ok().build();
    }
}
