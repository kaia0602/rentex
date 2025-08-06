package com.rentex.user.service;

import com.rentex.partner.domain.Partner;
import com.rentex.user.domain.User;
import com.rentex.user.dto.SignUpRequestDto;
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Long signUp(SignUpRequestDto requestDto) {
        if (userRepository.findByEmail(requestDto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());
        User newUser;

        if ("PARTNER".equalsIgnoreCase(requestDto.getUserType())) {
            newUser = Partner.builder()
                    .email(requestDto.getEmail())
                    .password(encodedPassword)
                    .name(requestDto.getName())
                    .nickname(requestDto.getNickname())
                    .businessNo(requestDto.getBusinessNo())
                    .contactEmail(requestDto.getContactEmail()) // 반영
                    .contactPhone(requestDto.getContactPhone()) // 반영
                    .build();
        }
        else {
            newUser = new User(
                    requestDto.getEmail(),
                    encodedPassword,
                    requestDto.getName(),
                    requestDto.getNickname());
        }

        User savedUser = userRepository.save(newUser);
        return savedUser.getId();
    }
}