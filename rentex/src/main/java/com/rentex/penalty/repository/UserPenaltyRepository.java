package com.rentex.penalty.repository;

import com.rentex.penalty.domain.PenaltyStatus;
import com.rentex.penalty.domain.Penalty;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserPenaltyRepository extends JpaRepository<Penalty, Long> {

    /** 특정 유저의 패널티 전체 조회 (최신순) */
    List<Penalty> findByUser_IdOrderByIdDesc(Long userId);

    /** 특정 유저의 상태별 패널티 조회 (최신순) */
    List<Penalty> findByUser_IdAndStatusOrderByIdDesc(Long userId, PenaltyStatus status);

    /** 특정 유저의 상태별 패널티 개수 */
    long countByUser_IdAndStatus(Long userId, PenaltyStatus status);

    /** 전체 유저 요약 조회 (USER만) */
    @Query(value = """
      SELECT 
        u.id AS userId,
        u.name AS name,
        u.email AS email,
        (SELECT COALESCE(SUM(CASE WHEN p.status='VALID' THEN p.point ELSE 0 END), 0)
           FROM penalty p WHERE p.user_id = u.id) AS penaltyPoints,
        (SELECT COUNT(*) FROM penalty p 
           WHERE p.user_id = u.id AND p.status = 'VALID') AS activeEntries,
        (SELECT MAX(p.given_at) FROM penalty p 
           WHERE p.user_id = u.id) AS lastGivenAt
      FROM users u
      WHERE u.role = 'USER'
        AND (:q IS NULL OR :q = '' 
             OR u.name  LIKE CONCAT('%', :q, '%')
             OR u.email LIKE CONCAT('%', :q, '%'))
      ORDER BY penaltyPoints DESC, u.id DESC
      LIMIT :limit OFFSET :offset
    """, nativeQuery = true)
    List<AdminPenaltyUserProjection> searchUserSummariesOnlyUsers(@Param("q") String q,
                                                                  @Param("limit") int limit,
                                                                  @Param("offset") int offset);

    /** 전체 계정 요약 조회 (USER + ADMIN + PARTNER) */
    @Query(value = """
  SELECT 
    u.id AS userId,
    u.name AS name,
    u.email AS email,
    (SELECT COALESCE(SUM(CASE WHEN p.status='VALID' THEN p.point ELSE 0 END), 0)
       FROM penalty p WHERE p.user_id = u.id) AS penaltyPoints,
    (SELECT COUNT(*) FROM penalty p 
       WHERE p.user_id = u.id AND p.status = 'VALID') AS activeEntries,
    (SELECT MAX(p.given_at) FROM penalty p 
       WHERE p.user_id = u.id) AS lastGivenAt,
    u.role AS role
  FROM users u
  WHERE (:q IS NULL OR :q = '' 
           OR u.name  LIKE CONCAT('%', :q, '%')
           OR u.email LIKE CONCAT('%', :q, '%'))
    AND (:role IS NULL OR :role = 'ALL' OR u.role = :role)
  ORDER BY penaltyPoints DESC, u.id DESC
  LIMIT :limit OFFSET :offset
""", nativeQuery = true)
    List<AdminPenaltyUserProjection> searchUserSummariesAll(@Param("q") String q,
                                                            @Param("role") String role,
                                                            @Param("limit") int limit,
                                                            @Param("offset") int offset);

    /** 특정 유저 요약 (상세 화면 상단용) */
    @Query(value = """
        SELECT
          u.id             AS userId,
          u.name           AS name,
          u.email          AS email,
          u.penalty_points AS penaltyPoints,
          COALESCE(COUNT(p.id), 0) AS activeEntries,
          MAX(p.given_at)  AS lastGivenAt
        FROM users u
        LEFT JOIN penalty p 
               ON p.user_id = u.id
              AND p.status  = 'VALID'
        WHERE u.id = :userId
        GROUP BY u.id, u.name, u.email
        """,
            nativeQuery = true)
    AdminPenaltyUserProjection findUserSummary(@Param("userId") Long userId);
}
