package com.rentex.statistics.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminPartnerSummaryDTO {
    private Long partnerId;
    private String partnerName;

    private Long totalRentals;
    private Long totalQuantity;
    private Long totalDays;
    private Long totalRevenue;
}
