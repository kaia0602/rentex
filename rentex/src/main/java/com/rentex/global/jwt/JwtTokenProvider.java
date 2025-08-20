package com.rentex.global.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    private static final String AUTHORITIES_KEY = "auth";
    private final Key key;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey,
                            @Value("${jwt.access-token-expiration-in-seconds}") long accessExpSec,
                            @Value("${jwt.refresh-token-expiration-in-seconds}") long refreshExpSec) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValidityInMilliseconds = accessExpSec * 1000;
        this.refreshTokenValidityInMilliseconds = refreshExpSec * 1000;
    }

    /* =====================================================
       권장 발급 API (로그인/재발급에서 사용)
       ===================================================== */

    /**
     * 사용자의 ID와 역할을 기반으로 Access Token을 생성합니다.
     *
     * @param userId 사용자의 고유 ID (PK)
     * @param role   사용자의 역할 (e.g., "USER", "ADMIN")
     * @return 생성된 Access Token
     */
    public String createAccessToken(Long userId, String role) {
        String authorities = "ROLE_" + role;
        return createToken(userId, authorities, accessTokenValidityInMilliseconds);
    }

    /**
     * Refresh Token을 생성합니다. (권한 정보를 포함하지 않음)
     *
     * @param userId 사용자의 고유 ID (PK)
     * @return 생성된 Refresh Token
     */
    public String createRefreshToken(Long userId) {
        return createToken(userId, null, refreshTokenValidityInMilliseconds);
    }

    /* =====================================================
       파싱 / 검증 / 인증 변환
       ===================================================== */

    /**
     * 토큰의 유효성을 검증합니다.
     *
     * @param token 검증할 토큰
     * @return 유효하면 true
     */
    public boolean validateToken(String token) {
        if (!StringUtils.hasText(token) || token.chars().filter(ch -> ch == '.').count() != 2) {
            log.error("Invalid JWT token format.");
            return false;
        }
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT token.");
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 토큰에서 UserId(subject)를 추출합니다.
     *
     * @param token 추출할 토큰
     * @return 사용자 ID (PK)
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * 토큰에서 Authentication 객체를 생성하여 반환합니다. (Spring Security 컨텍스트에서 사용)
     *
     * @param token 인증 정보를 생성할 토큰
     * @return 생성된 Authentication 객체
     */
    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);

        Collection<? extends GrantedAuthority> authorities = Optional
                .ofNullable(claims.get(AUTHORITIES_KEY))
                .map(Object::toString)
                .map(s -> Arrays.stream(s.split(",")))
                .orElseGet(() -> Arrays.stream(new String[]{}))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        User principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    /* =====================================================
       내부 유틸리티 메서드
       ===================================================== */

    /**
     * 토큰을 파싱하여 클레임(정보)을 추출하는 내부 메서드.
     *
     * @param token 파싱할 토큰
     * @return 토큰에 담긴 Claims
     */
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 토큰을 생성하는 핵심 내부 메서드.
     *
     * @param userId         토큰의 주체 (subject)가 될 사용자 ID
     * @param authorities    토큰에 담을 권한 정보 (nullable)
     * @param validityMillis 만료 시간 (밀리초)
     * @return 생성된 JWT 문자열
     */
    private String createToken(Long userId, String authorities, long validityMillis) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityMillis);

        JwtBuilder builder = Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256);

        if (StringUtils.hasText(authorities)) {
            builder.claim(AUTHORITIES_KEY, authorities);
        }

        return builder.compact();
    }
}