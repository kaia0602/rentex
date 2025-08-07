package com.rentex.rental.repository;

import com.rentex.rental.domain.Rental;
import com.rentex.rental.domain.RentalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalHistoryRepository extends JpaRepository<RentalHistory, Long> {
    List<RentalHistory> findByRentalOrderByCreatedAtAsc(Rental rental);

}
