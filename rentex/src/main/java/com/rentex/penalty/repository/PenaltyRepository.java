package com.rentex.penalty.repository;

import com.rentex.penalty.domain.Penalty;
import com.rentex.penalty.domain.PenaltyStatus;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {

    /** user.id 기준 전체 조회 */
    List<Penalty> findByUser_Id(Long userId);

    /** user.id 기준 전체 삭제 */
    void deleteByUser_Id(Long userId);

    /** 연관 User 객체로 조회 */
    List<Penalty> findByUser(User user);

    /** 미납 패널티 존재 여부 */
    boolean existsByUserAndPaidFalse(User user);

    /** 패널티 초기화 (모든 패널티를 0점 + 납부처리) */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = 0, p.paid = true, p.status = 'DELETED' WHERE p.user.id = :userId")
    void resetPenalty(@Param("userId") Long userId);

    /** 패널티 증가 (가장 최신 row 업데이트 or 신규 생성 로직은 Service에서 결정) */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = p.point + :point , p.paid = false WHERE p.user.id = :userId")
    void increasePenalty(@Param("userId") Long userId, @Param("point") int point);

    /** 특정 유저의 패널티 전체 조회 (User 함께 fetch) */
    @Query("""
        SELECT p
        FROM Penalty p
        JOIN FETCH p.user u
        WHERE u.id = :userId
    """)
    List<Penalty> findAllByUserId(@Param("userId") Long userId);

    long countByUserAndStatus(User user, PenaltyStatus status);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update Penalty p
           set p.status = :to,
               p.deletedAt = CURRENT_TIMESTAMP
         where p.user = :user
           and p.status = :from
    """)
    int bulkUpdateStatusByUser(User user,
                               PenaltyStatus from,
                               PenaltyStatus to);
}
