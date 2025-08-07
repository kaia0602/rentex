package com.rentex.rental.dto;

import com.rentex.rental.domain.RentalStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record RentalDetailResponseDto(
        Long id,
        String itemName,
        int quantity,
        RentalStatus status,
        LocalDate startDate,
        LocalDate endDate,
        LocalDateTime rentedAt,
        LocalDateTime returnedAt
) {}
