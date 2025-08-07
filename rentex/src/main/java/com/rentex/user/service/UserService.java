package com.rentex.user.service;

import com.rentex.partner.domain.Partner;
import com.rentex.user.domain.User;
import com.rentex.user.dto.SignUpRequestDTO;
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
    public Long signUp(SignUpRequestDTO requestDTO) {
        if (userRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(requestDTO.getPassword());
        User newUser;

        if ("PARTNER".equalsIgnoreCase(requestDTO.getUserType())) {
            newUser = Partner.builder()
                    .email(requestDTO.getEmail())
                    .password(encodedPassword)
                    .name(requestDTO.getName())
                    .nickname(requestDTO.getNickname())
                    .businessNo(requestDTO.getBusinessNo())
                    .contactEmail(requestDTO.getContactEmail()) // 반영
                    .contactPhone(requestDTO.getContactPhone()) // 반영
                    .build();
        }
        else {
            newUser = new User(
                    requestDTO.getEmail(),
                    encodedPassword,
                    requestDTO.getName(),
                    requestDTO.getNickname());
        }

        User savedUser = userRepository.save(newUser);
        return savedUser.getId();
    }
}