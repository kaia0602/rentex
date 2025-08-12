package com.rentex.rental.repository;

import com.rentex.rental.domain.RentalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentalHistoryRepository extends JpaRepository<RentalHistory, Long> {
}