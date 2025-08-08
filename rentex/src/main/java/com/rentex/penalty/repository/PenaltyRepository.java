package com.rentex.penalty.repository;

import com.rentex.penalty.domain.Penalty;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {

    Optional<Penalty> findByUserId(Long userId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = 0, p.paid = true WHERE p.user.id = :userId")
    void resetPenalty(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Penalty p SET p.point = p.point + :score WHERE p.user.id = :userId")
    void increasePenalty(@Param("userId") Long userId, @Param("score") int score);


}