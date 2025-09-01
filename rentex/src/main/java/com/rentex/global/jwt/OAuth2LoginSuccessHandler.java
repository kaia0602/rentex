package com.rentex.global.jwt;

import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl; // 예: https://d27o3825w6jlji.cloudfront.net

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        System.out.println(">>> SUCCESS HANDLER CALLED <<<");

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // ── 1) 사용자 정보 추출 (구글/네이버 공통 처리)
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new IllegalStateException("OAuth2에서 email을 가져오지 못했습니다.");
        }
        String name = nvl(oAuth2User.getAttribute("name"), "소셜사용자");
        String picture = oAuth2User.getAttribute("picture"); // 구글: picture, 네이버는 CustomOAuth2UserService에서 변환 필요

        // ── 2) 유저 조회/생성
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .nickname(name)
                    .role("USER")
                    .password("SOCIAL_LOGIN_PASSWORD")
                    .profileImageUrl(picture)
                    .build();
        } else {
            user.updateNickname(name);
            if (picture != null) {
                user.updateProfileImage(picture);
            }
        }
        user = userRepository.save(user);

        // ── 3) JWT 발급
        Long userId = user.getId();
        String role = user.getRole();
        String accessToken = jwtTokenProvider.createAccessTokenByUserId(userId, role);
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        // ── 4) Refresh Token은 HttpOnly 쿠키에 저장
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true)            // HTTPS에서만 동작 (EB + CloudFront 환경)
                .sameSite("None")        // 크로스 도메인 허용
                .path("/")
                .maxAge(60L * 60L * 24L * 14L)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        // ── 5) 프론트로 리다이렉트 (AccessToken + RefreshToken 함께 전달)
        String redirectUrl = String.format(
                "%s/oauth/callback?accessToken=%s&refreshToken=%s",
                frontendUrl,
                URLEncoder.encode(accessToken, StandardCharsets.UTF_8),
                URLEncoder.encode(refreshToken, StandardCharsets.UTF_8)
        );
        response.sendRedirect(redirectUrl);
    }

    private static String nvl(String v, String alt) {
        return v == null || v.isBlank() ? alt : v;
    }
}
