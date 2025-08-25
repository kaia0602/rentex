package com.rentex.statistics.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PartnerMonthlyStatementDTO {
    private Integer year;
    private Integer month;

    private Long totalRentals;
    private Long totalQuantity;
    private Long totalDays;
    private Long totalRevenue;
    private long totalRevenueAllTime;

    private List<PartnerMonthlyItemDetailDTO> details;
}
