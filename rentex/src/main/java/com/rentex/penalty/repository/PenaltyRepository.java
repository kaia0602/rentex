package com.rentex.penalty.repository;

import com.rentex.penalty.domain.Penalty;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {

    Optional<Penalty> findByUserId(Long userId);
    void deleteByUserId(Long userId);   // ✅ 바로 쓸 거
    List<Penalty> findByUser(User user);  // ✅ 추가
    boolean existsByUserAndPaidFalse(User user);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = 0, p.paid = true WHERE p.user.id = :userId")
    void resetPenalty(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = p.point + :point , p.paid = false WHERE p.user.id = :userId")
    void increasePenalty(@Param("userId") Long userId, @Param("point") int point);

    @Query("""
        SELECT p
        FROM Penalty p
        JOIN FETCH p.user u
        WHERE u.id = :userId
    """)
    List<Penalty> findAllByUserId(@Param("userId") Long userId);

}