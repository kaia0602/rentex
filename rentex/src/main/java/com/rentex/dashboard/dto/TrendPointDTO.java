package com.rentex.dashboard.dto;

public record TrendPointDTO(
        String label,
        long requested,
        long received,
        long returned
) {}
