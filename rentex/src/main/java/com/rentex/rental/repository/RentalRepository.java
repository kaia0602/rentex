package com.rentex.rental.repository;

import com.rentex.penalty.dto.PartnerStatisticsDto;
import com.rentex.rental.domain.Rental;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {

    @Query("SELECT r FROM Rental r WHERE r.status = 'RENTED' AND r.endDate < :today AND r.isOverdue = false")
    List<Rental> findOverdueRentals(@Param("today") LocalDate today);

    @Query("""
    SELECT new com.rentex.penalty.dto.PartnerStatisticsDto(
        p.name,
        COUNT(r.id),
        SUM(r.quantity),
        SUM(DATEDIFF(r.endDate, r.startDate) + 1),
        SUM(r.quantity * (DATEDIFF(r.endDate, r.startDate) + 1) * i.dailyPrice)
    )
    FROM Rental r
    JOIN r.item i
    JOIN i.partner p
    WHERE r.status = 'RETURNED'
    GROUP BY p.name
""")
    List<PartnerStatisticsDto> getPartnerStatistics();
}
