package com.rentex.statistics.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PartnerMonthlyItemDetailDTO {
    private Long itemId;
    private String itemName;
    private Long quantity;   // 합계 수량
    private Long unitPrice;  // i.daily_price
    private Long days;       // 합계 대여일수
    private Long amount;        // 총액 = unitPrice * quantity * days
}
