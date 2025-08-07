package com.rentex.global.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentex.user.dto.LoginRequestDTO;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    // `/api/login` 요청 시, 이메일과 비밀번호를 기반으로 인증 토큰을 생성
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        try {
            ObjectMapper om = new ObjectMapper();
            LoginRequestDTO loginRequestDTO = om.readValue(request.getInputStream(), LoginRequestDTO.class);

            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(loginRequestDTO.getEmail(), loginRequestDTO.getPassword());

            // UserDetailsService의 loadUserByUsername()이 호출되어 인증을 시도
            return authenticationManager.authenticate(authenticationToken);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // 인증 성공 시 호출됨
    // 여기에서 JWT를 생성하고 응답 헤더에 추가
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException {
        // authResult 객체를 그대로 넘겨 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(authResult);

        response.addHeader("Authorization", "Bearer " + accessToken);
        response.getWriter().write("Login successful. Token is in the Authorization header.");
        response.getWriter().flush();
    }

    // 인증 실패 시 호출됨
    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException {
        response.setStatus(401); // Unauthorized
        response.getWriter().write("Login failed: " + failed.getMessage());
        response.getWriter().flush();
    }
}