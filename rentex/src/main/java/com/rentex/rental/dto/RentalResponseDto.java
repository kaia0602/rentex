package com.rentex.rental.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rentex.rental.domain.Rental;
import com.rentex.rental.domain.RentalStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

public record RentalResponseDto(
        Long id,
        String itemName,
        int quantity,
        RentalStatus status,
        String statusLabel,     // 상태 이름 (ex. 대여중)
        String badgeColor,      // 상태 색상 (ex. green)
        LocalDate startDate,
        LocalDate endDate,
        LocalDateTime rentedAt,
        LocalDateTime returnedAt,
        int dDay,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt,
        String userName,        // ✅ 본명
        String userNickname,     // ✅ 닉네임
        String thumbnailUrl,
        int totalFee,
        String categoryName,   // ✅ 카테고리명
        String partnerName     // ✅ 업체명
) {
    public static RentalResponseDto from(Rental rental) {
        // 기본값
        int dDay = -1;

        // 실제 대여중(RECEIVED)일 때만 D-Day 계산
        if (rental.getStatus() == RentalStatus.RECEIVED) {
            dDay = Period.between(LocalDate.now(), rental.getEndDate()).getDays();
        }

        String name = rental.getUser() != null ? rental.getUser().getName() : "(알 수 없음)";
        String nickname = rental.getUser() != null ? rental.getUser().getNickname() : "(알 수 없음)";

        // 대여일수 (시작~끝 포함, 최소 1일)
        int rentalDays = Period.between(rental.getStartDate(), rental.getEndDate()).getDays() + 1;

        // 총 대여료 계산 (하루 단가 × 수량 × 일수)
        int totalFee = rental.getItem().getDailyPrice() * rental.getQuantity() * rentalDays;

        return new RentalResponseDto(
                rental.getId(),
                rental.getItem().getName(),
                rental.getQuantity(),
                rental.getStatus(),
                rental.getStatus().getLabel(),
                rental.getStatus().getBadgeColor(),
                rental.getStartDate(),
                rental.getEndDate(),
                rental.getRentedAt(),
                rental.getReturnedAt(),
                dDay,
                rental.getCreatedAt(),
                name,       // 본명
                nickname,   // 닉네임
                rental.getItem().getThumbnailUrl(),
                totalFee,
                rental.getItem().getCategory() != null ? rental.getItem().getCategory().getName() : null, // ✅ 카테고리
                rental.getItem().getPartner() != null ? rental.getItem().getPartner().getName() : null   // ✅ 업체명
        );
    }
}
