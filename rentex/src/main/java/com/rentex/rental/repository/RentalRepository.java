package com.rentex.rental.repository;

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

    /**
     * 특정 유저가 대여한 Rental 목록 조회
     * @param userId 유저 ID
     * @return 해당 유저의 Rental 목록
     */
    @Query("SELECT r FROM Rental r WHERE r.user.id = :userId")
    List<Rental> findByUserId(@Param("userId") Long userId);

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
