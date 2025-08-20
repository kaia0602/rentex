package com.rentex.user.service;

import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email + " -> 데이터베이스에서 찾을 수 없습니다."));

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
        // ✅ 탈퇴한 회원인지 확인
>>>>>>> origin/feature/rentaladd
>>>>>>> origin/feature/user-auth
        if (user.getWithdrawnAt() != null) {
            throw new DisabledException("이미 탈퇴 처리된 계정입니다.");
        }

        // 디버깅 로그 (비밀번호 비교 제거됨)
        log.info("로그인 검증 - email={}, dbPw={}", user.getEmail(), user.getPassword());

        return createUserDetails(user);
    }

    private UserDetails createUserDetails(User user) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole())
        );

        // ✅ [수정] 첫 번째 인자를 사용자 ID에서 이메일로 변경합니다.
        return new org.springframework.security.core.userdetails.User(
<<<<<<< HEAD
                user.getEmail(), // String.valueOf(user.getId()) -> user.getEmail()
=======
<<<<<<< HEAD
                user.getEmail(), // String.valueOf(user.getId()) -> user.getEmail()
=======
                user.getEmail(),
>>>>>>> origin/feature/rentaladd
>>>>>>> origin/feature/user-auth
                user.getPassword(),
                authorities
        );
    }
}
