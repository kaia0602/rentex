// src/main/java/com/rentex/global/jwt/JwtTokenProvider.java
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
                            @Value("${jwt.expiration-in-seconds}") long accessExpSec,
                            @Value("${jwt.refresh-token-expiration-in-seconds}") long refreshExpSec) {
        // HS256 키는 최소 256bit(=32바이트) 이상 권장. 짧으면 여기서 예외 날 수 있음.
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValidityInMilliseconds = accessExpSec * 1000;
        this.refreshTokenValidityInMilliseconds = refreshExpSec * 1000;
    }

    /* =====================================================
       권장 발급 API (로그인/재발급에서 사용)
       ===================================================== */

    /**
     * PK + ROLE 기반 Access Token 생성 (권장)
     */
    public String createAccessTokenByUserId(Long userId, String role) {
        String authorities = "ROLE_" + role; // USER/PARTNER/ADMIN → ROLE_*
        return createToken(userId, authorities, accessTokenValidityInMilliseconds);
    }

    /**
     * Refresh Token 생성 (subject=userId, 더 긴 만료)
     */
    public String createRefreshToken(Long userId) {
        // refresh에는 권한 클레임이 꼭 필요하진 않지만, 일관성 위해 최소 ROLE 표기
        return createToken(userId, "ROLE_USER", refreshTokenValidityInMilliseconds);
    }

    /* =====================================================
       레거시/호환 메서드 (가능하면 위 오버로드 사용 권장)
       ===================================================== */

    /**
     * Authentication 기반 AccessToken 생성.
     * principal의 username이 "userId" 문자열이라고 가정된 레거시 방식.
     * 이메일을 username으로 쓰는 환경이면 사용하지 말 것.
     */
    public String createAccessToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        String username = ((User) authentication.getPrincipal()).getUsername();
        try {
            Long userId = Long.valueOf(username); // username이 PK가 아닐 수 있음(이메일인 경우 X)
            return createToken(userId, authorities, accessTokenValidityInMilliseconds);
        } catch (NumberFormatException e) {
            log.warn("[JwtTokenProvider] principal.username이 숫자형 PK가 아님. createAccessTokenByUserId(...) 사용 권장");
            throw new IllegalStateException("principal username이 userId가 아닙니다. createAccessTokenByUserId를 사용하세요.");
        }
    }



    /* =====================================================
       파싱/검증/인증 변환
       ===================================================== */

    /**
     * 토큰 유효성 검증
     */
    public boolean validateToken(String token) {
        if (!StringUtils.hasText(token) || token.chars().filter(ch -> ch == '.').count() != 2) {
            log.error("Invalid JWT token format");
            return false;
        }
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT token");
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 토큰에서 userId(subject) 추출
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * 토큰에서 Authentication 생성 (리소스 서버에서 사용)
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

        // subject=userId 이므로 username에 id 문자열 세팅
        User principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    /* =====================================================
       내부 유틸
       ===================================================== */

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private String createToken(Long userId, String authorities, long validityMillis) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityMillis);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim(AUTHORITIES_KEY, authorities)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}