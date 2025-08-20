package com.rentex.penalty.repository;

import com.rentex.penalty.domain.Penalty;
import com.rentex.user.domain.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {

<<<<<<< HEAD
    @Query("SELECT p FROM Penalty p JOIN FETCH p.user WHERE p.user.id = :userId")
    Optional<Penalty> findByUserId(@Param("userId") Long userId);

    void deleteByUserId(Long userId);   // ✅ 바로 쓸 거

    List<Penalty> findByUser(User user);  // ✅ 추가

=======
    /** user.id 기준 전체 조회 */
    List<Penalty> findByUser_Id(Long userId);

    /** user.id 기준 전체 삭제 */
    void deleteByUser_Id(Long userId);

    /** 연관 User 객체로 조회 */
    List<Penalty> findByUser(User user);

    /** 미납 패널티 존재 여부 */
>>>>>>> origin/feature/rentaladd
    boolean existsByUserAndPaidFalse(User user);

    /** 패널티 초기화 (모든 패널티를 0점 + 납부처리) */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = 0, p.paid = true WHERE p.user.id = :userId")
    void resetPenalty(@Param("userId") Long userId);

    /** 패널티 증가 (가장 최신 row 업데이트 or 신규 생성 로직은 Service에서 결정) */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = p.point + :point , p.paid = false WHERE p.user.id = :userId")
    void increasePenalty(@Param("userId") Long userId, @Param("point") int point);

<<<<<<< HEAD
    // 마이 페이지 벌점 확인을 위한 기본 벌점 생성(0점)
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO penalty (user_id, point, paid, created_at, updated_at) VALUES (:userId, 0, true, NOW(), NOW())", nativeQuery = true)
    void createDefaultPenaltyForUser(@Param("userId") Long userId);

    // 마이 페이지 벌점 확인을 위한 기본 벌점 생성(0점)
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO penalty (user_id, point, paid, created_at, updated_at) VALUES (:userId, 0, true, NOW(), NOW())", nativeQuery = true)
    void createDefaultPenaltyForUser(@Param("userId") Long userId);


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
}
>>>>>>> origin/feature/rentaladd
