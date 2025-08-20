package com.rentex.rental.dto;

import com.rentex.rental.domain.ActionActor;
import com.rentex.rental.domain.RentalHistory;
import com.rentex.rental.domain.RentalStatus;

import java.time.LocalDateTime;

public record RentalHistoryResponseDto(
        RentalStatus fromStatus,
        RentalStatus toStatus,
        String fromStatusLabel,
        String toStatusLabel,
        String actorName,   // ✅ 표시할 이름 (닉네임 / 파트너명 / 관리자)
        String message,
        LocalDateTime createdAt
) {
    public static RentalHistoryResponseDto from(RentalHistory history) {
        String actorName;

        if (history.getActorUser() != null) {
            // ✅ 기록 저장 시점에 User 객체를 넣어줬다면, 무조건 그 닉네임 우선
            actorName = history.getActorUser().getNickname();
        } else {
            // ✅ actorUser 없을 때만 fallback
            switch (history.getActor()) {
                case USER -> actorName = history.getRental().getUser() != null
                        ? history.getRental().getUser().getNickname()
                        : "(알 수 없음)";
                case PARTNER -> actorName = history.getRental().getItem().getPartner().getName();
                case ADMIN -> actorName = "관리자"; // fallback
                default -> actorName = "(알 수 없음)";
            }
        }

        return new RentalHistoryResponseDto(
                history.getFromStatus(),
                history.getToStatus(),
                history.getFromStatus() != null ? history.getFromStatus().getLabel() : null,
                history.getToStatus() != null ? history.getToStatus().getLabel() : null,
                actorName,
                history.getDescription(),
                history.getCreatedAt()
        );
    }
}
