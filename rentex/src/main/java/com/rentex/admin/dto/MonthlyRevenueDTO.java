package com.rentex.admin.dto;

public record MonthlyRevenueDTO(
        String month,   // "2025-01"
        Long revenue    // 해당 월 총 수익
) {}