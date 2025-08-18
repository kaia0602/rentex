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

import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenValidityInMilliseconds;
    private static final String AUTHORITIES_KEY = "auth";

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey,
                            @Value("${jwt.expiration-in-seconds}") long expiration) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
        this.accessTokenValidityInMilliseconds = expiration * 1000;
    }

    /** 일반 로그인용 Access Token 생성 */
    public String createAccessToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        // UserDetails의 username 대신, User PK를 꺼내도록 UserDetailsService 수정 필요
        Long userId = Long.valueOf(((User) authentication.getPrincipal()).getUsername());
        return createToken(userId, authorities);
    }

    /** PK 기반 Access Token 생성 (소셜 로그인 등에서 직접 호출) */
    public String createAccessTokenByUserId(Long userId) {
        String authorities = "ROLE_USER"; // 필요 시 ROLE 지정
        return createToken(userId, authorities);
    }

    /** Refresh Token 생성 */
    public String createRefreshToken(Long userId) {
        String authorities = "ROLE_USER";
        return createToken(userId, authorities);
    }

    /** 토큰에서 UserId 추출 */
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return Long.parseLong(claims.getSubject());
    }

    /** 토큰 기반 Authentication 생성 */
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();

        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

        // subject가 PK이므로 username에 id를 문자열로 세팅
        User principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    /** 토큰 유효성 검증 */
    public boolean validateToken(String token) {
        if (!StringUtils.hasText(token) || token.chars().filter(ch -> ch == '.').count() != 2) {
            log.error("Invalid JWT token format");
            return false;
        }
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /** 공통 토큰 생성 로직 */
    private String createToken(Long userId, String authorities) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityInMilliseconds);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim(AUTHORITIES_KEY, authorities)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}

