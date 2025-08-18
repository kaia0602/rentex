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
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final EmailService emailService;

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
            // 프론트엔드 로그인 페이지로 리디렉션
            // return ResponseEntity.status(302).header("Location", "http://localhost:3000/authentication/sign-in?verified=true").build();

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
            // ✅ 소셜 로그인 사용자는 이 로직을 건너뜁니다.
            // 일반 로그인 시에만 이메일 인증 상태를 확인합니다.
            // 소셜 로그인은 별도의 OAuth2 컨트롤러에서 처리되므로 이곳에 영향을 주지 않습니다.

            var userOptional = userService.findByEmail(req.getEmail());
            if (userOptional.isPresent()) {
                var user = userOptional.get();
                if (user.getStatus() != User.UserStatus.ACTIVE) {
                    return ResponseEntity.status(401).body("로그인 실패: 이메일 인증이 필요합니다.");
                }
            } else {
                // 사용자를 찾을 수 없음
                return ResponseEntity.status(401).body("로그인 실패: 사용자를 찾을 수 없습니다.");
            }

            // 1) 스프링 시큐리티로 인증 시도
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            // 2) 액세스 토큰 발급
            String access = jwtTokenProvider.createAccessToken(auth);

            // 3) 현재 로그인한 사용자 ID
            Long userId = Long.valueOf(((UserDetails) auth.getPrincipal()).getUsername());

            // 4) 유저 조회
            var authUser = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

            // 5) 리프레시 토큰 발급 → HttpOnly 쿠키에 저장
            String refresh = jwtTokenProvider.createRefreshToken(authUser.getId());
            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, refresh)
                    .httpOnly(true)
                    .secure(false)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(60L * 60L * 24L * 14L)
                    .build();
            res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            // 6) 액세스 토큰을 헤더와 바디 둘 다로 반환
            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + access)
                    .body(new LoginResponseDTO(access, authUser.getId(), authUser.getName(), authUser.getRole()));

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

            // 2) 리프레시 토큰 검증
            boolean valid = jwtTokenProvider.validateToken(refreshCookie);
            if (!valid) return ResponseEntity.status(401).body(Map.of("message", "리프레시 토큰 무효"));

            // 3) 리프레시 토큰에서 userId 추출
            Long userId = jwtTokenProvider.getUserIdFromToken(refreshCookie);

            // 4) 유저 조회 (없으면 실패)
            var user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

            // ✅ 계정 상태 확인
            if (user.getStatus() != User.UserStatus.ACTIVE) {
                return ResponseEntity.status(401).body(Map.of("message", "계정이 비활성화되어 리프레시할 수 없습니다."));
            }

            // 5) 새 액세스 토큰 발급
            String newAccess = jwtTokenProvider.createAccessTokenByUserId(user.getId());

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