package com.rentex.rental.repository;

import com.rentex.rental.domain.RentalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalHistoryRepository extends JpaRepository<RentalHistory, Long> {

    @Query("select rh from RentalHistory rh " +
            "left join fetch rh.actorUser " +
            "where rh.rental.id = :rentalId " +
            "order by rh.createdAt asc")
    List<RentalHistory> findByRentalOrderByCreatedAtAsc(@Param("rentalId") Long rentalId);

}
