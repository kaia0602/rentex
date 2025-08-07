package com.rentex.penalty.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PartnerStatisticsDto {
    private String partnerName;
    private long totalRentals;
    private long totalQuantity;
    private long totalDays;
    private long totalRevenue;
}
