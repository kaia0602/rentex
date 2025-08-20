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
<<<<<<< HEAD
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            String email;
            Object principal = authentication.getPrincipal();

            if (principal instanceof OAuth2User oAuth2User) {
                log.info("소셜 로그인 성공. 후처리 시작...");
                email = oAuth2User.getAttribute("email");

                if (email == null) {
                    log.error("OAuth2 provider로부터 이메일을 받아오지 못했습니다. Attributes: {}", oAuth2User.getAttributes());
                    response.sendRedirect(frontendUrl + "/login?error=email_not_found");
                    return;
                }
            } else if (principal instanceof UserDetails userDetails) {
                email = userDetails.getUsername(); // UserDetailsService에서 반환한 username (이메일)
            } else {
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

            String accessToken = jwtTokenProvider.createAccessToken(userId, authorities);
            String refreshToken = jwtTokenProvider.createRefreshToken(userId);

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


            if (principal instanceof OAuth2User) {
                response.sendRedirect(frontendUrl + "/oauth-redirect?token=" + accessToken);
            } else {
                // 일반 로그인은 JSON 응답 반환
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
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"message\": \"로그인 처리 중 서버 에러가 발생했습니다.\"}");
        }
=======
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
>>>>>>> origin/feature/rentaladd
    }

    private static String nvl(String v, String alt) {
        return v == null || v.isBlank() ? alt : v;
    }
}
