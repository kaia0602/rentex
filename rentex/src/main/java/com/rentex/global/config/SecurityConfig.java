package com.rentex.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // CSRF 비활성화 (API용)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/rentals/**").permitAll() // 대여 요청 테스트용 허용
                        .requestMatchers("/api/admin/**").permitAll()    // 관리자 API도 임시 허용
                        .anyRequest().permitAll() // 테스트용 전체 오픈 (나중에 authenticated()로 바꿔도 됨)

                );

        return http.build();
    }
}
