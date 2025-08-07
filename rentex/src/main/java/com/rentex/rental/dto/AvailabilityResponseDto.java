package com.rentex.rental.dto;

import java.time.LocalDate;
import java.util.List;

public record AvailabilityResponseDto(
        boolean available,
        List<ConflictPeriodDto> conflictingPeriods
) {
    public record ConflictPeriodDto(
            Long rentalId,
            LocalDate startDate,
            LocalDate endDate
    ) {}
}
