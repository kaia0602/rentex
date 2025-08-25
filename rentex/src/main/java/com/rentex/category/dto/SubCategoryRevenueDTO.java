package com.rentex.category.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SubCategoryRevenueDTO {
    private String subCategoryName; // 소분류명
    private Long totalRevenue;      // 매출 합계
    private Long rentalCount;       // 판매 건수
}
