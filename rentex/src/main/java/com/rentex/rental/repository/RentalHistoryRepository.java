package com.rentex.rental.repository;

import com.rentex.rental.domain.RentalHistory;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RentalHistoryRepository extends JpaRepository<RentalHistory, Long> {

    @Query("select rh from RentalHistory rh " +
            "left join fetch rh.actorUser " +
            "where rh.rental.id = :rentalId " +
            "order by rh.createdAt asc")
    List<RentalHistory> findByRentalOrderByCreatedAtAsc(@Param("rentalId") Long rentalId);

    @Query(value = """
        select date(h.created_at) as d, h.to_status as s, count(*) as c
        from rental_history h
        where h.created_at >= :from and h.created_at < :to
        group by date(h.created_at), h.to_status
        order by d asc
    """, nativeQuery = true)
    List<Object[]> countDailyToStatus(@Param("from") LocalDateTime from,
                                      @Param("to") LocalDateTime to);

    // 최근 활동 (동적 limit 지원하려면 Pageable 사용)
    Page<RentalHistory> findByOrderByCreatedAtDesc(Pageable pageable);


}
