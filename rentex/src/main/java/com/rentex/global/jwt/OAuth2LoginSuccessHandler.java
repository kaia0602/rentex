package com.rentex.global.jwt;

import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private static String nvl(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new IllegalStateException("OAuth2 공급자로부터 email을 가져오지 못했습니다.");
        }
        String name = nvl(oAuth2User.getAttribute("name"), "소셜유저");

        // DB에 사용자가 없으면 새로 생성 (Find or Create)
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .nickname(name)
                    .role("USER")
                    .password("SOCIAL_LOGIN_PASSWORD") // 소셜 로그인 사용자는 비밀번호를 사용하지 않음
                    .status(User.UserStatus.ACTIVE) // 소셜 로그인은 바로 활성 상태
                    .build();
            return userRepository.save(newUser);
        });

        Long userId = user.getId();
        String role = user.getRole();

        // JWT 토큰 발급
        String accessToken = jwtTokenProvider.createAccessToken(userId, role);
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        // 리프레시 토큰을 HttpOnly 쿠키로 저장
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true)       // 운영 환경(HTTPS)에서는 true로 설정
                .sameSite("Lax")
                .path("/")
                .maxAge(60L * 60L * 24L * 14L) // 2주
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 프론트엔드로 Access Token과 함께 리다이렉트
        response.sendRedirect(frontendUrl + "/oauth-redirect?token=" + accessToken);
    }
}