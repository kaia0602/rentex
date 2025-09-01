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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

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

        System.out.println(">>> SUCCESS HANDLER CALLED <<<");

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // ── 1) 기본 정보 추출 (구글 OAuth2 표준 필드 사용)
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new IllegalStateException("구글 OAuth2에서 email을 가져오지 못했습니다.");
        }
        String name = nvl(oAuth2User.getAttribute("name"), "구글사용자");
        String picture = oAuth2User.getAttribute("picture"); // 구글 프로필 사진

        // ── 2) 유저 조회/생성 or 업데이트
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .nickname(name)
                    .role("USER")
                    .password("SOCIAL_LOGIN_PASSWORD")
                    .profileImageUrl(picture) // 신규 저장 시 프로필 이미지 반영
                    .build();
        } else {
            user.updateNickname(name);
            if (picture != null) {
                user.updateProfileImage(picture);
            }
        }

        user = userRepository.save(user);

        // ── 3) 토큰 발급
        Long userId = user.getId();
        String role = user.getRole();
        String accessToken = jwtTokenProvider.createAccessTokenByUserId(userId, role);
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        // ── 4) Refresh Token 쿠키 저장
        boolean isProd = !"local".equals(System.getProperty("spring.profiles.active"));

        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(isProd)                                // prod에서는 true
                .sameSite(isProd ? "None" : "Lax")            // prod는 None, local은 Lax
                .path("/")
                .maxAge(60L * 60L * 24L * 14L)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // ── 5) Access Token 헤더 추가
        response.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);

        // ── 6) 프론트로 리다이렉트
        String encoded = URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
        response.sendRedirect(frontendUrl + "/oauth/callback?token=" + encoded);    }

    private static String nvl(String v, String alt) {
        return v == null || v.isBlank() ? alt : v;
    }
}
