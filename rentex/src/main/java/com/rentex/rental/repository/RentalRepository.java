package com.rentex.rental.repository;

import com.rentex.item.domain.Item;
import com.rentex.rental.domain.Rental;
import com.rentex.rental.domain.RentalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {
    boolean existsByItemAndStatusIn(Item item, List<RentalStatus> statuses);
    Page<Rental> findByUserId(Long userId, Pageable pageable);
    Page<Rental> findByUserIdAndStatus(Long userId, RentalStatus status, Pageable pageable);
    Page<Rental> findAllByStatus(RentalStatus status, Pageable pageable);

    @Query("""
    SELECT COUNT(r) > 0
    FROM Rental r
    WHERE r.item.id = :itemId
      AND r.status IN ('APPROVED', 'RENTED', 'RETURN_REQUESTED')
      AND r.startDate <= :endDate
      AND r.endDate >= :startDate
""")
    boolean existsConflictingRental(@Param("itemId") Long itemId,
                                    @Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);

}
