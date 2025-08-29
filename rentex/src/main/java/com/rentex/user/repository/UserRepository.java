package com.rentex.user.repository;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // =========================================================
    // 🟢 [공통/인증] 로그인/식별 등에 공통 사용
    // =========================================================

    /** (포함) 이메일로 단건 조회 — 탈퇴자 포함 */
    Optional<User> findByEmail(String email);

    /** (제외) 이메일로 단건 조회 — 탈퇴자 제외 */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.withdrawnAt IS NULL")
    Optional<User> findActiveByEmail(@Param("email") String email);

    /** (포함) 이메일로 userId 조회 — 원본 유지(native) */
    @Query(value = "SELECT u.id FROM users u WHERE u.email = :email LIMIT 1", nativeQuery = true)
    Long findUserIdByEmail(@Param("email") String email);

    /** (제외) 이메일로 userId 조회 — 탈퇴자 제외(native) */
    @Query(value = "SELECT u.id FROM users u WHERE u.email = :email AND u.withdrawn_at IS NULL LIMIT 1", nativeQuery = true)
    Long findActiveUserIdByEmail(@Param("email") String email);

    /** (제외) 단건 조회 — 탈퇴자 제외 */
    Optional<User> findByIdAndWithdrawnAtIsNull(Long id);


    // =========================================================
    // 👤 [일반 유저 전용] (역할: USER) 화면/API에서 사용
    // =========================================================

    /** (포함) 일반 유저 목록 — 탈퇴자 포함 */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = 'USER'")
    List<UserResponseDTO> findAllUsers();

    /** (제외) 일반 유저 목록 — 탈퇴자 제외 */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = 'USER' AND u.withdrawnAt IS NULL")
    List<UserResponseDTO> findAllActiveUsers();


    // =========================================================
    // 🤝 [파트너 전용] (역할: PARTNER) 파트너 화면/API에서 사용
    // =========================================================

    /** (포함) 역할 기준 목록 — 탈퇴자 포함 */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = :role")
    List<UserResponseDTO> findAllByRole(@Param("role") String role);

    /** (제외) 역할 기준 목록 — 탈퇴자 제외 */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = :role AND u.withdrawnAt IS NULL")
    List<UserResponseDTO> findAllActiveByRole(@Param("role") String role);

    /** (포함) 파트너 목록 — 탈퇴자 포함 (편의 메서드) */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = 'PARTNER'")
    List<UserResponseDTO> findAllPartners();

    /** (제외) 파트너 목록 — 탈퇴자 제외 (편의 메서드) */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = 'PARTNER' AND u.withdrawnAt IS NULL")
    List<UserResponseDTO> findAllActivePartners();


    // =========================================================
    // 🛠️ [관리자 전용] 어드민 대시보드/관리 화면에서 사용
    // =========================================================

    // ✅ 호환 유지용 메서드 (관리자 전용: USER만, 탈퇴자 포함)
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = 'USER'")
    List<UserResponseDTO> findAllUsersForAdmin();

    /** (포함) 전체 유저 목록 — 탈퇴자 포함 (전체 역할) */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u")
    List<UserResponseDTO> findAllUsersForAdminAllRoles();

    /** (제외) 전체 유저 목록 — 탈퇴자 제외 (전체 역할) */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.withdrawnAt IS NULL")
    List<UserResponseDTO> findAllUsersForAdminActiveAllRoles();

    /** (포함) USER만 — 탈퇴자 포함 */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = 'USER'")
    List<UserResponseDTO> findAllUsersForAdminOnlyUser();

    /** (제외) USER만 — 탈퇴자 제외 */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints, " +
            "u.businessNo, u.contactEmail, u.contactPhone) " +
            "FROM User u WHERE u.role = 'USER' AND u.withdrawnAt IS NULL")
    List<UserResponseDTO> findAllUsersForAdminOnlyUserActive();

    /** (포함) 역할별 카운트 — 탈퇴자 포함 */
    long countByRole(String role);

    /** (제외) 역할별 카운트 — 탈퇴자 제외 */
    long countByRoleAndWithdrawnAtIsNull(String role);

    /** (포함) 전체 카운트 — 탈퇴자 포함 */
    long count();

    /** (제외) 전체 카운트 — 탈퇴자 제외 */
    long countByWithdrawnAtIsNull();


    // =========================================================
    // ⚖️ [벌점/패널티] 벌점 누적/차감/재계산
    // =========================================================

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE users SET penalty_points = COALESCE(penalty_points,0) + :delta WHERE id = :id", nativeQuery = true)
    int increasePenaltyPoints(@Param("id") Long userId, @Param("delta") int delta);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE users SET penalty_points = GREATEST(0, COALESCE(penalty_points,0) - :delta) WHERE id = :id", nativeQuery = true)
    int decreasePenaltyPoints(@Param("id") Long userId, @Param("delta") int delta);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE users SET penalty_points = 0 WHERE id = :id", nativeQuery = true)
    int resetPenaltyPoints(@Param("id") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value =
            "UPDATE users u " +
                    "SET u.penalty_points = ( " +
                    "  SELECT COALESCE(SUM(CASE WHEN p.status='VALID' THEN p.point ELSE 0 END),0) " +
                    "  FROM penalty p WHERE p.user_id = :id " +
                    ") " +
                    "WHERE u.id = :id", nativeQuery = true)
    int recalcPenaltyPoints(@Param("id") Long userId);


    // =========================================================
    // 📊 [통계/리포트] 월별 신규회원 수 등
    // =========================================================

    /** (포함) 월별 신규 회원 수 — 탈퇴 여부 무관, 생성일 기준 (원본 유지) */
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
