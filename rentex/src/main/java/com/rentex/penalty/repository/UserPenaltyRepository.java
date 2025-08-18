package com.rentex.penalty.repository;

import com.rentex.penalty.domain.PenaltyStatus;
import com.rentex.penalty.domain.Penalty;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserPenaltyRepository extends JpaRepository<Penalty, Long> {


    List<Penalty> findByUserIdOrderByIdDesc(Long userId);

    List<Penalty> findByUserIdAndStatusOrderByIdDesc(Long userId, PenaltyStatus status);

    long countByUserIdAndStatus(Long userId, PenaltyStatus status);

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
          COALESCE(COUNT(p.id), 0)               AS activeEntries,
          MAX(p.given_at)                      AS lastGivenAt
        FROM `user` u
        LEFT JOIN penalty p 
               ON p.user_id = u.id
              AND p.status  = 'VALID'
        WHERE u.id = :userId
        GROUP BY u.id, u.name, u.email, p.point
        """,
            nativeQuery = true)
    AdminPenaltyUserProjection findUserSummary(@Param("userId") Long userId);
}
