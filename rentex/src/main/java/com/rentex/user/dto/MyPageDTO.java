package com.rentex.user.dto;

import com.rentex.penalty.domain.Penalty;
import com.rentex.rental.domain.Rental;
import com.rentex.user.domain.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class MyPageDTO {
    private String email, name, nickname, role;
    private int penaltyPoints;
    private List<RentalInfo> rentalHistory;
    private List<PenaltyInfo> penaltyHistory;

    public static MyPageDTO from(User user, List<Rental> rentals, List<Penalty> penalties) {
        return MyPageDTO.builder()
                .email(user.getEmail()).name(user.getName()).nickname(user.getNickname())
                .role(user.getRole()).penaltyPoints(user.getPenaltyPoints())
                .rentalHistory(rentals.stream().map(RentalInfo::from).collect(Collectors.toList()))
                .penaltyHistory(penalties.stream().map(PenaltyInfo::from).collect(Collectors.toList()))
                .build();
    }
    @Getter @Builder
    private static class RentalInfo {
        private Long rentalId;
        private String itemName;
        private LocalDate startDate, endDate;
        private String status;
        public static RentalInfo from(Rental rental) {
            return RentalInfo.builder().rentalId(rental.getId()).itemName(rental.getItem().getName())
                    .startDate(rental.getStartDate()).endDate(rental.getEndDate())
                    .status(rental.getStatus().toString()).build();
        }
    }
    @Getter @Builder
    private static class PenaltyInfo {
        private int points;
        private String reason;
        private boolean isPaid;
        public static PenaltyInfo from(Penalty penalty) {
            return PenaltyInfo.builder().points(penalty.getPoints())
                    .reason(penalty.getReason()).isPaid(penalty.isPaid()).build();
        }
    }
}