package com.rentex.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MyPageResponseDTO {
    private String userName;
    private SummaryDTO summary;
    private List<RecentRentalDTO> recentRentals;

    @Getter
    @Builder
    public static class SummaryDTO {
        private long rentalsInProgress;
        private int penalties;
        private boolean unpaidPenalty;
    }

    @Getter
    @Builder
    public static class RecentRentalDTO {
        private Long id;
        private String itemName;
        private String rentalPeriod;
        private String status;
    }
}
