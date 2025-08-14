package com.rentex.global.jwt;

<<<<<<< HEAD
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
=======
import com.rentex.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
>>>>>>> origin/feature/admin-items
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
<<<<<<< HEAD
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
=======

import java.io.IOException;
>>>>>>> origin/feature/admin-items

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

<<<<<<< HEAD
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // ✅ CustomOAuth2UserService에서 이미 처리된 이메일 정보를 바로 사용합니다.
        String email = (String) attributes.get("email");

        // ✅ 이메일로 우리 DB의 사용자를 찾습니다.
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("소셜 로그인 사용자를 DB에서 찾을 수 없습니다. Email: " + email));

        // ✅ 우리 시스템의 고유 ID로 토큰을 생성합니다.
        String accessToken = jwtTokenProvider.createAccessToken(String.valueOf(user.getId()));

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth-redirect")
                .queryParam("token", accessToken)
                .build().toUriString();

        response.sendRedirect(targetUrl);
    }
}
=======
    @Value("${app.frontend-url}")
    private String frontendUrl; // application.yml에서 주입

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."))
                .getId();

        // Access & Refresh 토큰 발급
        String accessToken = jwtTokenProvider.createAccessTokenByUserId(userId);
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        // 리프레시 토큰을 HttpOnly 쿠키로 저장
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(false) // 운영에서는 true
                .sameSite("Lax")
                .path("/")
                .maxAge(60L * 60L * 24L * 14L)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 프론트엔드로 리다이렉트 + Access Token 전달
        response.sendRedirect(frontendUrl + "/oauth-redirect?token=" + accessToken);
    }
}
>>>>>>> origin/feature/admin-items
