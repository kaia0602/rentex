package com.rentex.penalty.repository;

import com.rentex.penalty.domain.Penalty;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PenaltyRepository extends JpaRepository<Penalty, Long> {
    List<Penalty> findByUser(User user);
    boolean existsByUserAndIsPaidFalse(User user);
}