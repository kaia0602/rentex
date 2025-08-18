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

import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    private static final String AUTHORITIES_KEY = "auth";
    private final Key key;
    private final long accessTokenValidityInMs;
    private final long refreshTokenValidityInMs;

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey,
                            @Value("${jwt.access-token-expiration-in-seconds}") long accessExpiration,
                            @Value("${jwt.refresh-token-expiration-in-seconds}") long refreshExpiration) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
        this.accessTokenValidityInMs = accessExpiration * 1000;
        this.refreshTokenValidityInMs = refreshExpiration * 1000;
    }

    /**
     * Access Token을 생성합니다. (사용자의 실제 권한을 담습니다)
     */
    public String createAccessToken(Long userId, String authorities) {
        return createToken(userId, authorities, accessTokenValidityInMs);
    }

    /**
     * Refresh Token을 생성합니다. (권한 정보를 포함하지 않습니다)
     */
    public String createRefreshToken(Long userId) {
        return createToken(userId, null, refreshTokenValidityInMs);
    }

    /**
     * 토큰에서 UserId를 추출합니다.
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return Long.parseLong(claims.getSubject());
    }

    /**
     * 토큰을 기반으로 Authentication 객체를 생성합니다.
     */
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();

        // 'auth' 클레임이 없는 경우(Refresh Token 등)를 대비해 null 체크 추가
        Object authoritiesClaim = claims.get(AUTHORITIES_KEY);
        Collection<? extends GrantedAuthority> authorities =
                authoritiesClaim == null ? Collections.emptyList() :
                        Arrays.stream(authoritiesClaim.toString().split(","))
                                .map(SimpleGrantedAuthority::new)
                                .collect(Collectors.toList());

        User principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    /**
     * 토큰의 유효성을 검증합니다.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 토큰을 생성하는 핵심 private 메소드
     */
    private String createToken(Long userId, String authorities, long validityInMs) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMs);

        JwtBuilder builder = Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256);

        // 권한 정보가 있는 경우에만 'auth' 클레임을 추가합니다.
        if (authorities != null && !authorities.isEmpty()) {
            builder.claim(AUTHORITIES_KEY, authorities);
        }

        return builder.compact();
    }
}