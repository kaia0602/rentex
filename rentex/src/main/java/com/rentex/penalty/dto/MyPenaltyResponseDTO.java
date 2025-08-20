package com.rentex.penalty.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rentex.penalty.domain.Penalty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MyPenaltyResponseDTO {

    private int totalPoints;   // 유효한 벌점 총합
    private boolean hasUnpaid; // 미납 벌점 여부
    private List<EntryDto> entries; // 벌점 엔트리 전체

    @Getter
    @Builder
    public static class EntryDto {
        private Long id;
        private String reason;
        private int points;

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        private LocalDateTime givenAt;

        private String status;

        // 추가 필드
        private String itemName;
        private LocalDate startDate;
        private LocalDate endDate;

        public static EntryDto from(Penalty penalty) {
            return EntryDto.builder()
                    .id(penalty.getId())
                    .reason(penalty.getReason())
                    .points(penalty.getPoint())
                    .givenAt(penalty.getGivenAt())
                    .status(penalty.getStatus().name())
                    .itemName(
                            penalty.getRental() != null ? penalty.getRental().getItem().getName() : null
                    )
                    .startDate(
                            penalty.getRental() != null ? penalty.getRental().getStartDate() : null
                    )
                    .endDate(
                            penalty.getRental() != null ? penalty.getRental().getEndDate() : null
                    )
                    .build();
        }
    }
}
