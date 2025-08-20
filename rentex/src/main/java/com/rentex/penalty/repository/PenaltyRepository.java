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
import java.util.Optional;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {

    @Query("SELECT p FROM Penalty p JOIN FETCH p.user WHERE p.user.id = :userId")
    Optional<Penalty> findByUserId(@Param("userId") Long userId);

    void deleteByUserId(Long userId);   // ✅ 바로 쓸 거

    List<Penalty> findByUser(User user);  // ✅ 추가

    boolean existsByUserAndPaidFalse(User user);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = 0, p.paid = true WHERE p.user.id = :userId")
    void resetPenalty(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = p.point + :score WHERE p.user.id = :userId")
    void increasePenalty(@Param("userId") Long userId, @Param("score") int score);

    // 마이 페이지 벌점 확인을 위한 기본 벌점 생성(0점)
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO penalty (user_id, point, paid, created_at, updated_at) VALUES (:userId, 0, true, NOW(), NOW())", nativeQuery = true)
    void createDefaultPenaltyForUser(@Param("userId") Long userId);


}