package com.rentex.admin.service;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    /** 전체 사용자 조회 */
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAllUsersForAdmin();
    }

    /** 역할별 조회 (USER / PARTNER / ADMIN) */
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getUsersByRole(String role) {
        return userRepository.findAllByRole(role.toUpperCase());
    }

    /** 단일 사용자 조회 */
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID=" + id));

        return new UserResponseDTO(user); // DTO 변환 생성자 활용
    }
}
