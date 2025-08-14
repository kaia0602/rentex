package com.rentex.rental.repository;

<<<<<<< HEAD
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
=======
import com.rentex.penalty.dto.PartnerStatisticsDto;
import com.rentex.item.domain.Item;
import com.rentex.rental.domain.Rental;
import com.rentex.rental.domain.RentalStatus;
import com.rentex.user.domain.User; // ✅ 우리 도메인 User import
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

    // ✅ User 엔티티 기반 메서드 추가 (탈퇴 시 사용)
    boolean existsByUserAndStatusNotIn(User user, List<RentalStatus> statuses);

    List<Rental> findByUser(User user); // MyPage 조회용

    Page<Rental> findByUserId(Long userId, Pageable pageable);

    Page<Rental> findByUserIdAndStatus(Long userId, RentalStatus status, Pageable pageable);

    Page<Rental> findAllByStatus(RentalStatus status, Pageable pageable);

    List<Rental> findByUserId(Long userId);

    @Query("""
    SELECT r FROM Rental r
    WHERE r.item.id = :itemId
      AND r.status IN ('REQUESTED', 'APPROVED', 'RENTED')
      AND (
            (r.startDate <= :endDate AND r.endDate >= :startDate)
          )
""")
    List<Rental> findConflictingRentals(
            @Param("itemId") Long itemId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT r FROM Rental r WHERE r.status = 'RENTED' AND r.endDate < :today AND r.isOverdue = false")
    List<Rental> findOverdueRentals(@Param("today") LocalDate today);

    @Query(value = """
        SELECT 
            p.name AS partnerName,
            COUNT(r.id) AS totalRentals,
            SUM(r.quantity) AS totalQuantity,
            SUM(DATEDIFF(r.end_date, r.start_date) + 1) AS totalDays,
            SUM(r.quantity * (DATEDIFF(r.end_date, r.start_date) + 1) * i.daily_price) AS totalAmount
        FROM rental r
        JOIN item i ON r.item_id = i.id
        JOIN partner p ON i.partner_id = p.id
        WHERE r.status = 'RETURNED'
        GROUP BY p.name
    """, nativeQuery = true)
    List<PartnerStatisticsDto> getPartnerStatistics();

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
>>>>>>> origin/feature/admin-items
