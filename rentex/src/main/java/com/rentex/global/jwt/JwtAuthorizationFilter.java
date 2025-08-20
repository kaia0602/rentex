package com.rentex.global.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthorizationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 요청 헤더에서 토큰 추출
        String token = resolveToken(request);

        // 2. 토큰이 존재하고 JWT 구조( .이 2개 )인지 체크
        if (StringUtils.hasText(token) && token.chars().filter(ch -> ch == '.').count() == 2) {

            // 3. 토큰 유효성 검증
            if (jwtTokenProvider.validateToken(token)) {
                // 4. 인증 정보 세팅
                Authentication authentication = jwtTokenProvider.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(authentication);


            }
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }

    // 요청 헤더에서 "Bearer " 접두사를 제거하고 토큰만 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
