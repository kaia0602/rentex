package com.rentex.user.repository;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /** 이메일로 단건 조회 */
    Optional<User> findByEmail(String email);

    /** 역할(Role) 기준 조회 (USER / PARTNER / ADMIN) */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = :role")
    List<UserResponseDTO> findAllByRole(@Param("role") String role);

    /** 전체 유저 리스트 (관리자 전용) */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u")
    List<UserResponseDTO> findAllUsersForAdmin();

    /** 일반 유저만 조회 */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = 'USER'")
    List<UserResponseDTO> findAllUsers();

    /** 이메일로 userId 조회 */
    @Query(value = "SELECT u.id FROM users u WHERE u.email = :email LIMIT 1", nativeQuery = true)
    Long findUserIdByEmail(@Param("email") String email);

    /** 벌점 가산 */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE users SET penalty_points = COALESCE(penalty_points,0) + :delta WHERE id = :id", nativeQuery = true)
    int increasePenaltyPoints(@Param("id") Long userId, @Param("delta") int delta);

    /** 벌점 차감 */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE users SET penalty_points = GREATEST(0, COALESCE(penalty_points,0) - :delta) WHERE id = :id", nativeQuery = true)
    int decreasePenaltyPoints(@Param("id") Long userId, @Param("delta") int delta);

    /** 벌점 초기화 */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE users SET penalty_points = 0 WHERE id = :id", nativeQuery = true)
    int resetPenaltyPoints(@Param("id") Long userId);

    /** 벌점 재계산 (penalty 테이블 기준) */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value =
            "UPDATE users u " +
                    "SET u.penalty_points = ( " +
                    "  SELECT COALESCE(SUM(CASE WHEN p.status='VALID' THEN p.point ELSE 0 END),0) " +
                    "  FROM penalty p WHERE p.user_id = :id " +
                    ") " +
                    "WHERE u.id = :id", nativeQuery = true)
    int recalcPenaltyPoints(@Param("id") Long userId);

    // 일반 회원만 카운트
    long countByRole(String role);

    long count();

    /** 월별 신규 회원 수 조회 (1~12월, 없으면 0으로 채움) */
    @Query(value = """
        SELECT DATE_FORMAT(u.created_at, '%Y-%m') AS ym,
               COUNT(*) AS newUsers
        FROM users u
        WHERE u.role = 'USER' AND u.created_at BETWEEN :from AND :to
        GROUP BY DATE_FORMAT(u.created_at, '%Y-%m')
        ORDER BY ym
        """, nativeQuery = true)
    List<Object[]> findMonthlyNewUsers(@Param("from") String from, @Param("to") String to);

}
