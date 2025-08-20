package com.rentex.penalty.repository;

import com.rentex.penalty.domain.Penalty;
import com.rentex.penalty.domain.PenaltyStatus;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {

    /**
     * User 엔티티 객체로 패널티 목록 조회
     */
    List<Penalty> findByUser(User user);

    /**
     * user.id로 패널티 목록 조회
     */
    List<Penalty> findByUser_Id(Long userId);

    /**
     * user.id로 패널티 전체 삭제
     */
    void deleteByUser_Id(Long userId);

    /**
     * 특정 유저의 미납 패널티 존재 여부 확인
     */
    boolean existsByUserAndPaidFalse(User user);

    /**
     * 특정 유저의 패널티 전체 조회 (성능 최적화를 위해 User 엔티티를 함께 Fetch)
     */
    @Query("""
                SELECT p
                FROM Penalty p
                JOIN FETCH p.user u
                WHERE u.id = :userId
            """)
    List<Penalty> findAllByUserId(@Param("userId") Long userId);

    /**
     * 특정 유저의 모든 패널티를 초기화 (0점, 납부처리)
     */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = 0, p.paid = true, p.status = 'DELETED' WHERE p.user.id = :userId")
    void resetPenalty(@Param("userId") Long userId);

    /**
     * 특정 유저에게 벌점을 부과합니다.
     * 참고: 이 메서드는 기존 패널티 점수에 더하는 방식이며,
     * 신규 패널티를 생성할지 기존 패널티를 업데이트할지는 Service 레이어에서 결정해야 합니다.
     */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = p.point + :point, p.paid = false WHERE p.user.id = :userId")
    void increasePenalty(@Param("userId") Long userId, @Param("point") int point);
<<<<<<< HEAD
}
=======

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
>>>>>>> origin/feature/rentaladd
