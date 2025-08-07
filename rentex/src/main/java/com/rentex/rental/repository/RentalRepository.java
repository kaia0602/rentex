package com.rentex.rental.repository;

import com.rentex.penalty.dto.PartnerStatisticsDto;
import com.rentex.item.domain.Item;
import com.rentex.rental.domain.Rental;
import org.springframework.data.jpa.repository.*;
import com.rentex.rental.domain.RentalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    boolean existsByItemAndStatusIn(Item item, List<RentalStatus> statuses);
    Page<Rental> findByUserId(Long userId, Pageable pageable);
    Page<Rental> findByUserIdAndStatus(Long userId, RentalStatus status, Pageable pageable);
    Page<Rental> findAllByStatus(RentalStatus status, Pageable pageable);

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
    SELECT COUNT(r) > 0
    FROM Rental r
    JOIN r.item i
    JOIN i.partner p
    WHERE r.status = 'RETURNED'
    GROUP BY p.name
    WHERE r.item.id = :itemId
      AND r.status IN ('APPROVED', 'RENTED', 'RETURN_REQUESTED')
      AND r.startDate <= :endDate
      AND r.endDate >= :startDate
""")
    List<PartnerStatisticsDto> getPartnerStatistics();
    boolean existsConflictingRental(@Param("itemId") Long itemId,
                                    @Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);

}
