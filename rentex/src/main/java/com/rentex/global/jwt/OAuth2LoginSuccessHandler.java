package com.rentex.global.jwt;

import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import jakarta.servlet.ServletException;
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

@Slf4j // 로깅을 위한 어노테이션 추가
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        // --- 에러 추적을 위한 try-catch 블록 추가 ---
        try {
            log.info("OAuth2 로그인 성공. 후처리 시작...");
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");

            if (email == null) {
                log.error("OAuth2 provider로부터 이메일을 받아오지 못했습니다. Attributes: {}", oAuth2User.getAttributes());
                response.sendRedirect(frontendUrl + "/login?error=email_not_found");
                return;
            }
            log.info("이메일로 사용자 조회 시작: {}", email);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
            log.info("사용자 조회 성공: userId={}", user.getId());

            Long userId = user.getId();
            String authorities = "ROLE_" + user.getRole();

            log.info("Access Token 생성 시작...");
            String accessToken = jwtTokenProvider.createAccessToken(userId, authorities);
            log.info("Access Token 생성 완료.");

            log.info("Refresh Token 생성 시작...");
            String refreshToken = jwtTokenProvider.createRefreshToken(userId);
            log.info("Refresh Token 생성 완료.");

            log.info("쿠키 생성 및 리다이렉트 시작...");
            ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(60L * 60L * 24L * 14L)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            // ▼ 소셜 로그인 액세스 토큰 발급 확인용, 사용할 때 마다 주석 해제하면 됨
//            response.sendRedirect(frontendUrl + "/oauth-redirect?token=" + accessToken);
            log.info("리다이렉트 완료.");

        } catch (Exception e) {
            // 예외 발생 시, 전체 에러 로그를 콘솔에 출력합니다.
            log.error("OAuth2 로그인 성공 후 처리 과정에서 예외가 발생했습니다.", e);

            // 기본 에러 페이지로 리다이렉트합니다.
            response.sendRedirect(frontendUrl + "/login?error=internal_server_error");
        }
    }
}
