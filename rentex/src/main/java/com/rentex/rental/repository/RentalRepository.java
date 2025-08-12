package com.rentex.rental.repository;

import com.rentex.rental.domain.Rental;
import com.rentex.rental.domain.RentalStatus;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    // 사용자의 모든 대여 내역을 찾는 쿼리
    List<Rental> findByUser(User user);

    // 사용자의 특정 상태가 아닌 대여 건이 존재하는지 확인하는 쿼리
    boolean existsByUserAndStatusNotIn(User user, List<RentalStatus> statuses);
}