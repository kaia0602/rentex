package com.rentex.dashboard.dto;

public record RevenuePointDTO(
        String label,  // ex) "2025-08"
        long revenue   // 총 매출 (원 단위)
) {}
