package com.rentex.penalty.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MyPenaltyResponseDTO {
    private int totalPoints;                     // 미납 벌점 총합
    private boolean hasUnpaid;                   // 미납 여부
    private List<PenaltyWithRentalDTO> recentRentals; // 최근 대여 3건
}
