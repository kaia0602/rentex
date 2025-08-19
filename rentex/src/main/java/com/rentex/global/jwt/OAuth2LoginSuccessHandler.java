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
import org.springframework.security.core.userdetails.UserDetails;
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

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            String email;
            Object principal = authentication.getPrincipal();

            // =================== 로그인 방식에 따라 분기 처리 ===================
            if (principal instanceof OAuth2User oAuth2User) {
                // --- 1. 소셜 로그인일 경우 ---
                log.info("소셜 로그인 성공. 후처리 시작...");
                email = oAuth2User.getAttribute("email");

                if (email == null) {
                    log.error("OAuth2 provider로부터 이메일을 받아오지 못했습니다. Attributes: {}", oAuth2User.getAttributes());
                    response.sendRedirect(frontendUrl + "/login?error=email_not_found");
                    return;
                }
            } else if (principal instanceof UserDetails userDetails) {
                // --- 2. 일반 로그인일 경우 ---
                log.info("일반 로그인 성공. 후처리 시작...");
                email = userDetails.getUsername(); // UserDetailsService에서 반환한 username (이메일)
            } else {
                // --- 3. 예상치 못한 타입의 Principal일 경우 ---
                log.error("처리할 수 없는 Principal 타입입니다: {}", principal.getClass().getName());
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"message\": \"알 수 없는 사용자 인증 타입입니다.\"}");
                return;
            }
            // =================================================================

            log.info("이메일로 사용자 조회 시작: {}", email);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
            log.info("사용자 조회 성공: userId={}", user.getId());

            // =================== 공통 JWT 발급 로직 ===================
            Long userId = user.getId();
            String authorities = "ROLE_" + user.getRole();

            log.info("Access Token 생성 시작...");
            String accessToken = jwtTokenProvider.createAccessToken(userId, authorities);
            log.info("Access Token 생성 완료.");

            log.info("Refresh Token 생성 시작...");
            String refreshToken = jwtTokenProvider.createRefreshToken(userId);
            log.info("Refresh Token 생성 완료.");

            log.info("⭐ [로그인 성공] 발급된 Access Token: {}", accessToken);
            log.info("⭐ [로그인 성공] 발급된 Refresh Token: {}", refreshToken);
            // ==========================================================

            // Refresh Token을 담을 쿠키 생성 (공통)
            ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                    .httpOnly(true)
                    .secure(true) // HTTPS 환경에서만 전송
                    .sameSite("Lax") // CSRF 방지
                    .path("/")
                    .maxAge(60L * 60L * 24L * 14L) // 2주
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());


            // =================== 로그인 방식에 따라 다른 응답 처리 ===================
            if (principal instanceof OAuth2User) {
                // 소셜 로그인은 프론트엔드로 리다이렉트
                log.info("소셜 로그인 리다이렉트...");
                // Access Token은 URL 쿼리 파라미터로 전달 (보안상 권장되지는 않으나, 프론트에서 즉시 사용하기 위함)
                // 또는 바디에 담아 전달 후 리다이렉트 하는 방식을 고려할 수 있습니다.
                response.sendRedirect(frontendUrl + "/oauth-redirect?token=" + accessToken);
            } else {
                // 일반 로그인은 JSON 응답 반환
                log.info("일반 로그인 JSON 응답 생성...");
                response.setStatus(HttpServletResponse.SC_OK);
                response.setContentType("application/json;charset=UTF-8");
                response.setHeader("Authorization", "Bearer " + accessToken); // 헤더에도 AccessToken 추가

                String responseBody = String.format(
                        "{\"message\": \"로그인에 성공했습니다.\", \"accessToken\": \"%s\"}",
                        accessToken
                );
                response.getWriter().write(responseBody);
            }
            // =====================================================================

        } catch (Exception e) {
            log.error("로그인 성공 후 처리 과정에서 예외가 발생했습니다.", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\": \"로그인 처리 중 서버 에러가 발생했습니다.\"}");
        }
    }
}
