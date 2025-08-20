package com.rentex.penalty.dto;

import lombok.Generated;

public class PartnerStatisticsDto {
    private final String partnerName;
    private final long totalRentals;
    private final long totalQuantity;
    private final long totalDays;
    private final long totalRevenue;

    @Generated
    public PartnerStatisticsDto(String partnerName, long totalRentals, long totalQuantity, long totalDays, long totalRevenue) {
        this.partnerName = partnerName;
        this.totalRentals = totalRentals;
        this.totalQuantity = totalQuantity;
        this.totalDays = totalDays;
        this.totalRevenue = totalRevenue;
    }

    @Generated
    public String getPartnerName() {
        return this.partnerName;
    }

    @Generated
    public long getTotalRentals() {
        return this.totalRentals;
    }

    @Generated
    public long getTotalQuantity() {
        return this.totalQuantity;
    }

    @Generated
    public long getTotalDays() {
        return this.totalDays;
    }

    @Generated
    public long getTotalRevenue() {
        return this.totalRevenue;
    }
}
