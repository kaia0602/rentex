package com.rentex.penalty.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@Builder
public class PenaltyWithRentalDTO {
    private Long penaltyId;
    private int point;
    private boolean paid;

    private String itemName;
    private LocalDate startDate;
    private LocalDate endDate;
}

