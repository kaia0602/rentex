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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.stream.Collectors;

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
        // 1. Authentication 객체에서 UserDetails를 꺼냅니다.
        User userDetails = (User) authResult.getPrincipal();

        // 2. UserDetails에서 사용자 ID(PK)를 추출합니다. (getUsername()이 ID를 반환하도록 설정했음)
        Long userId = Long.parseLong(userDetails.getUsername());

        // 3. UserDetails에서 권한 정보를 문자열로 변환합니다.
        String authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        // 4. 추출한 userId와 authorities를 사용하여 Access Token을 생성합니다.
        String accessToken = jwtTokenProvider.createAccessToken(userId, authorities);
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        // 5. 응답 헤더에 Access Token과 Refresh Token을 추가합니다.
        response.addHeader("Authorization", "Bearer " + accessToken);
        response.addHeader("Refresh-Token", refreshToken); // Refresh Token도 함께 전달
        response.getWriter().write("Login successful. Tokens are in the response headers.");
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
