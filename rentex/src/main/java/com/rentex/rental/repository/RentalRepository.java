package com.rentex.rental.repository;

import com.rentex.category.dto.SubCategoryRevenueDTO;
import com.rentex.item.domain.Item;
import com.rentex.rental.domain.Rental;
import com.rentex.rental.domain.RentalStatus;
import com.rentex.user.domain.User;
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

    // User 엔티티 기반 메서드 추가 (탈퇴 시 사용)
    boolean existsByUserAndStatusNotIn(User user, List<RentalStatus> statuses);

    List<Rental> findByUser(User user); // MyPage 조회용

    Page<Rental> findByUserId(Long userId, Pageable pageable);

    Page<Rental> findByUserIdAndStatus(Long userId, RentalStatus status, Pageable pageable);

    Page<Rental> findAllByStatus(RentalStatus status, Pageable pageable);

    Page<Rental> findAll(Pageable pageable);  // 전체 상태 조건 없이

    @Query("SELECT r FROM Rental r WHERE r.user.id = :userId")
    List<Rental> findByUserId(@Param("userId") Long userId);

    /** 대여 가능 여부 확인 시 기간 겹치는 렌탈 조회 (RETURN_REQUESTED 포함으로 통일) */
    @Query("""
        SELECT r FROM Rental r
        WHERE r.item.id = :itemId
          AND r.status IN ('REQUESTED', 'APPROVED', 'SHIPPED', 'RECEIVED', 'RETURN_REQUESTED')
          AND (r.startDate <= :endDate AND r.endDate >= :startDate)
    """)
    List<Rental> findConflictingRentals(
            @Param("itemId") Long itemId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /** 연체된 렌탈 조회 (RECEIVED 상태에서 반납기한 초과) */
    @Query("SELECT r FROM Rental r WHERE r.status = 'RECEIVED' AND r.endDate < :today AND r.isOverdue = false")
    List<Rental> findOverdueRentals(@Param("today") LocalDate today);

    /** 특정 아이템이 주어진 기간에 이미 예약/대여 중인지 여부 */
    @Query("""
        SELECT COUNT(r) > 0
        FROM Rental r
        WHERE r.item.id = :itemId
          AND r.status IN ('APPROVED', 'SHIPPED', 'RECEIVED', 'RETURN_REQUESTED')
          AND r.startDate <= :endDate
          AND r.endDate >= :startDate
    """)
    boolean existsConflictingRental(@Param("itemId") Long itemId,
                                    @Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);

    @Query("SELECT r FROM Rental r WHERE r.user.id = :userId ORDER BY r.startDate DESC")
    List<Rental> findRecentRentalsByUserId(@Param("userId") Long userId, Pageable pageable);

    /** 해당 월과 기간이 겹치는 모든 렌탈(아이템/파트너 같이 로딩) */
    @Query("""
        select r
        from Rental r
        join fetch r.item i
        join fetch i.partner p
        where r.startDate <= :monthEnd and r.endDate >= :monthStart
    """)
    List<Rental> findAllOverlapping(@Param("monthStart") LocalDate monthStart,
                                    @Param("monthEnd") LocalDate monthEnd);

    /** 특정 파트너의 해당 월 겹침 렌탈 */
    @Query("""
        select r
        from Rental r
        join fetch r.item i
        join fetch i.partner p
        where p.id = :partnerId
          and r.startDate <= :monthEnd and r.endDate >= :monthStart
    """)
    List<Rental> findAllByPartnerOverlapping(@Param("partnerId") Long partnerId,
                                             @Param("monthStart") LocalDate monthStart,
                                             @Param("monthEnd") LocalDate monthEnd);

    /** 특정 파트너의 요청 상태별 대여 목록 조회 */
    Page<Rental> findByItemPartnerIdAndStatus(Long partnerId, RentalStatus status, Pageable pageable);

    /** 특정 파트너의 전체 조회 목록 */
    @Query("SELECT r FROM Rental r " +
            "JOIN r.item i " +
            "WHERE i.partner.id = :partnerId " +
            "AND (:status IS NULL OR r.status = :status)")
    Page<Rental> findByPartnerItemAndStatus(@Param("partnerId") Long partnerId,
                                            @Param("status") RentalStatus status,
                                            Pageable pageable);


    // REQUESTED 상태인 대여 수
    @Query("SELECT COUNT(r) FROM Rental r WHERE r.item.partner.id = :partnerId AND r.status = 'REQUESTED'")
    Long countPendingByPartnerId(@Param("partnerId") Long partnerId);

    // RETURN_REQUESTED 상태인 대여 수 추가 가능
    @Query("SELECT COUNT(r) FROM Rental r WHERE r.item.partner.id = :partnerId AND r.status = 'RETURN_REQUESTED'")
    Long countReturnRequestedByPartnerId(@Param("partnerId") Long partnerId);

    // 로그인한 파트너가 등록한 장비 중 RECEIVED 상태인 대여 수
    @Query("SELECT COUNT(r) FROM Rental r WHERE r.item.partner.id = :partnerId AND r.status = 'RECEIVED'")
    Long countActiveByPartnerId(@Param("partnerId") Long partnerId);

    long count();

    @Query("SELECT new com.rentex.category.dto.SubCategoryRevenueDTO(" +
            "i.subCategory.name, SUM(i.dailyPrice * r.quantity), COUNT(r)) " +
            "FROM Rental r " +
            "JOIN r.item i " +
            "GROUP BY i.subCategory.name " +
            "ORDER BY SUM(i.dailyPrice * r.quantity) DESC")
    List<SubCategoryRevenueDTO> findTopSubCategoryRevenue();
}

