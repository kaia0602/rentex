package com.rentex.user.controller;

import com.rentex.global.jwt.JwtTokenProvider;
import com.rentex.user.dto.LoginRequestDTO;
import com.rentex.user.dto.LoginResponseDTO;
import com.rentex.user.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    /**
     * 로그인: 이메일/비번 인증 → 액세스 토큰 발급 + 리프레시 쿠키 저장
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO req, HttpServletResponse res) {
        try {
            // 1) 스프링 시큐리티로 인증 시도
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            // 2) 액세스 토큰 발급 (이미 필터에서 쓰던 메서드 그대로 사용)
            String access = jwtTokenProvider.createAccessToken(auth);

            // 3) 현재 로그인한 사용자 이메일
            Long userId = Long.valueOf(((UserDetails) auth.getPrincipal()).getUsername());

            // 4) 이메일로 유저 조회 (Optional이라 없으면 예외)
            var user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

            // 5) 리프레시 토큰 발급 → HttpOnly 쿠키에 저장
            String refresh = jwtTokenProvider.createRefreshToken(user.getId());
            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, refresh)
                    .httpOnly(true)   // JS에서 못 읽음 (XSS 대비)
                    .secure(false)    // 운영(HTTPS)에서는 true
                    .sameSite("Lax")  // 다른 도메인이면 "None"+secure(true)
                    .path("/")
                    .maxAge(60L * 60L * 24L * 14L) // 14일
                    .build();
            res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            // 6) 액세스 토큰을 헤더와 바디 둘 다로 반환 (프론트 편의)
            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + access)
                    .body(new LoginResponseDTO(access, user.getId(), user.getName(), user.getRole()));

        } catch (Exception e) {
            // 인증 실패 시 401
            return ResponseEntity.status(401).body("로그인 실패: " + e.getMessage());
        }
    }

    /**
     * 액세스 토큰 재발급: 리프레시 쿠키 검증 → 새 액세스/리프레시 발급
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(value = REFRESH_COOKIE, required = false) String refreshCookie,
            HttpServletResponse res
    ) {
        try {
            // 1) 쿠키 없으면 실패
            if (refreshCookie == null) {
                return ResponseEntity.status(401).body(Map.of("message", "리프레시 토큰 없음"));
            }

            // 2) 리프레시 토큰 검증 (access/refresh 공용 validate면 이걸 사용)
            boolean valid = jwtTokenProvider.validateToken(refreshCookie); // TODO: 메서드명 다르면 맞춰 변경
            if (!valid) return ResponseEntity.status(401).body(Map.of("message", "리프레시 토큰 무효"));

            // 3) 리프레시 토큰에서 userId 추출
            Long userId = jwtTokenProvider.getUserIdFromToken(refreshCookie); // TODO: 메서드명 다르면 맞춰 변경

            // 4) 유저 조회 (없으면 실패)
            var user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

            // 5) 새 액세스 토큰 발급
            String newAccess = jwtTokenProvider.createAccessTokenByUserId(user.getId()); // TODO: 없으면 대안 주석 참고

            // 6) (선택) 리프레시 토큰 회전: 새 토큰 발급 → 쿠키 교체
            String newRefresh = jwtTokenProvider.createRefreshToken(user.getId());
            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, newRefresh)
                    .httpOnly(true).secure(false).sameSite("Lax").path("/").maxAge(60L * 60L * 24L * 14L).build();
            res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            // 7) 새 액세스 토큰 반환
            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + newAccess)
                    .body(Map.of("accessToken", newAccess));

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
                .httpOnly(true).secure(false).sameSite("Lax").path("/").maxAge(0).build();
        res.addHeader(HttpHeaders.SET_COOKIE, delete.toString());
        return ResponseEntity.ok().build();
    }
}
