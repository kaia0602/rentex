package com.rentex.admin.service;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAllUsers();
    }

    // 단일 사용자 조회
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return UserResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .nickname(user.getNickname())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .penaltyPoints(user.getPenaltyPoints())
                .build();
    }


}