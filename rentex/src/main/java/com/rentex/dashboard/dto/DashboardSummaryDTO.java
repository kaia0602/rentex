package com.rentex.dashboard.dto;

public record DashboardSummaryDTO(
        long totalRentals,
        long activeRentals,
        long availableItems,
        long overdueCount,
        long partners
) {}
