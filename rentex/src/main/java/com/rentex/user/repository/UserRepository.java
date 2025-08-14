package com.rentex.user.repository;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/**
 *  임시용 UserRepository
 * 테스트용 유저 조회 (findById)만 사용하며, 추후 JWT 인증 연동 시 삭제 또는 교체
 *
 * TODO: 이후 팀원(User 도메인 담당자)이 정식 UserRepository 구현 시 이 파일 삭제할 것
 */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(u.id, u.email, u.name, u.nickname,  u.role, u.createdAt, u.penaltyPoints) " +
            "FROM User u " + "WHERE u.role = 'USER'")
    List<UserResponseDTO> findAllUsers();
}
