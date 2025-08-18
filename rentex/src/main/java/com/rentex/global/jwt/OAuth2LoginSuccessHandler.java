package com.rentex.global.jwt;

import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl; // 예: https://rentex-frontend.yourdomain.com

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // ── 1) 프로바이더별 attribute 안전 추출
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            // 필요시 다른 키 시도 (ex. kakao_account.email, response.email 등)
            throw new IllegalStateException("OAuth2 공급자로부터 email을 가져오지 못했습니다.");
        }
        String name = nvl(oAuth2User.getAttribute("name"),
                nvl(oAuth2User.getAttribute("nickname"), "소셜유저"));

        // ── 2) 유저 조회/생성
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            // 최초 소셜 로그인 사용자는 비밀번호 사용 안 함 → 고정 문자열
            return User.builder()
                    .email(email)
                    .name(name)
                    .nickname(name)
                    .role("USER")                  // 기본 권한
                    .password("SOCIAL_LOGIN_PASSWORD")
                    .build();
        });

        // 신규 생성된 경우 저장
        if (user.getId() == null) {
            user = userRepository.save(user);
        }

        Long userId = user.getId();
        String role = user.getRole(); // USER / PARTNER / ADMIN

        // ── 3) 토큰 발급 (ROLE 반영)
        String accessToken = jwtTokenProvider.createAccessTokenByUserId(userId, role);
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        // ── 4) 리프레시 토큰을 HttpOnly 쿠키로 저장
        // 운영(프론트와 도메인 분리/HTTPS)에서는 .secure(true).sameSite("None") 필수
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(false)         // TODO: prod에서는 true
                .sameSite("Lax")       // TODO: 크로스도메인이면 "None" + secure(true)
                .path("/")
                .maxAge(60L * 60L * 24L * 14L) // 14일
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // ── 5) 편의: 헤더에도 액세스 토큰 추가
        response.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);

        // ── 6) 프론트로 리다이렉트 (현재 구조 유지)
        // 보안상 쿼리스트링 전달은 노출 가능성 있음 → 나중에 one-time code or postMessage로 개선 고려
        response.sendRedirect(frontendUrl + "/oauth-redirect?token=" + accessToken);
    }

    private static String nvl(String v, String alt) {
        return v == null || v.isBlank() ? alt : v;
    }
}
