package com.rentex.penalty.repository;

import com.rentex.penalty.domain.PenaltyStatus;
import com.rentex.penalty.domain.UserPenalty;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserPenaltyRepository extends JpaRepository<UserPenalty, Long> {

    // --- Service에서 직접 사용 중인 메서드들 ---
    List<UserPenalty> findByUserIdOrderByIdDesc(Long userId);

    List<UserPenalty> findByUserIdAndStatusOrderByIdDesc(Long userId, PenaltyStatus status);

    long countByUserIdAndStatus(Long userId, PenaltyStatus status);

    @Query(value = """
  SELECT 
    u.id AS userId,
    u.name AS name,
    u.email AS email,
    /* 표시용 벌점은 로그 합계로 계산: 컬럼이 안 갱신돼도 UI는 정확 */
    (SELECT COALESCE(SUM(CASE WHEN up.status='VALID' THEN up.points ELSE 0 END), 0)
       FROM user_penalty up WHERE up.user_id = u.id) AS penaltyPoints,
    (SELECT COUNT(*) FROM user_penalty up 
       WHERE up.user_id = u.id AND up.status = 'VALID') AS activeEntries,
    (SELECT MAX(up.given_at) FROM user_penalty up 
       WHERE up.user_id = u.id) AS lastGivenAt
  FROM `user` u
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


    /**
     * 상세 화면 상단 요약(단일 사용자)
     * - Service.userSummary()에서 사용
     */
    @Query(value = """
        SELECT
          u.id                                    AS userId,
          u.name                                  AS name,
          u.email                                 AS email,
          u.penalty_points                        AS penaltyPoints,
          COALESCE(COUNT(up.id), 0)               AS activeEntries,
          MAX(up.created_at)                      AS lastGivenAt
        FROM `user` u
        LEFT JOIN user_penalty up 
               ON up.user_id = u.id
              AND up.status  = 'VALID'
        WHERE u.id = :userId
        GROUP BY u.id, u.name, u.email, u.penalty_points
        """,
            nativeQuery = true)
    AdminPenaltyUserProjection findUserSummary(@Param("userId") Long userId);
}
