package com.rentex.user.repository;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 사용자(User) 엔티티에 대한 데이터 액세스 처리를 위한 Repository
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(String email);

    /**
     * 이메일 인증 토큰으로 사용자 조회
     */
    Optional<User> findByEmailVerificationToken(String emailVerificationToken);

    /**
     * 역할(Role) 기준으로 모든 사용자 정보 조회 (관리자용 DTO)
     */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = :role")
    List<UserResponseDTO> findAllByRole(@Param("role") String role);

    /**
     * 전체 사용자 리스트 조회 (관리자용 DTO)
     */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u")
    List<UserResponseDTO> findAllUsersForAdmin();

    /**
     * 이메일로 userId 조회 (네이티브 쿼리)
     */
    @Query(value = "SELECT u.id FROM users u WHERE u.email = :email LIMIT 1", nativeQuery = true)
    Long findUserIdByEmail(@Param("email") String email);

    /**
     * 벌점 가산 (네이티브 쿼리)
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE users SET penalty_points = COALESCE(penalty_points,0) + :delta WHERE id = :id", nativeQuery = true)
    int increasePenaltyPoints(@Param("id") Long userId, @Param("delta") int delta);

    /**
     * 벌점 차감 (네이티브 쿼리)
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE users SET penalty_points = GREATEST(0, COALESCE(penalty_points,0) - :delta) WHERE id = :id", nativeQuery = true)
    int decreasePenaltyPoints(@Param("id") Long userId, @Param("delta") int delta);

    /**
     * 벌점 초기화 (네이티브 쿼리)
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE users SET penalty_points = 0 WHERE id = :id", nativeQuery = true)
    int resetPenaltyPoints(@Param("id") Long userId);

    /**
     * 벌점 재계산 (penalty 테이블 기준, 네이티브 쿼리)
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value =
            "UPDATE users u " +
                    "SET u.penalty_points = ( " +
                    "  SELECT COALESCE(SUM(CASE WHEN p.status='VALID' THEN p.point ELSE 0 END),0) " +
                    "  FROM penalty p WHERE p.user_id = :id " +
                    ") " +
                    "WHERE u.id = :id", nativeQuery = true)
    int recalcPenaltyPoints(@Param("id") Long userId);
}