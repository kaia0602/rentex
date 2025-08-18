package com.rentex.user.repository;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /** 이메일로 단건 조회 */
    Optional<User> findByEmail(String email);

    /** 역할(Role) 기준 조회 (USER / PARTNER / ADMIN) */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints) " +
            "FROM User u WHERE u.role = :role")
    List<UserResponseDTO> findAllByRole(@Param("role") String role);

    /** 전체 유저 리스트 (관리자 전용) */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints) " +
            "FROM User u")
    List<UserResponseDTO> findAllUsersForAdmin();
}
