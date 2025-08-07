package com.rentex.rental.dto;

import com.rentex.rental.domain.Rental;
import com.rentex.rental.domain.RentalStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

public record RentalResponseDto(
        Long id,
        String itemName,
        int quantity,
        RentalStatus status,
        LocalDate startDate,
        LocalDate endDate,
        LocalDateTime rentedAt,
        LocalDateTime returnedAt,
        int dDay
) {
    public static RentalResponseDto from(Rental rental) {
        int dDay = Period.between(LocalDate.now(), rental.getEndDate()).getDays(); // ✅ D-day 계산
        return new RentalResponseDto(
                rental.getId(),
                rental.getItem().getName(),
                rental.getQuantity(),
                rental.getStatus(),
                rental.getStartDate(),
                rental.getEndDate(),
                rental.getRentedAt(),
                rental.getReturnedAt(),
                dDay
        );
    }
}
