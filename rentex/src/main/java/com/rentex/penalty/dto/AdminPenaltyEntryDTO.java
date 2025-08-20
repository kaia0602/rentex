package com.rentex.penalty.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminPenaltyEntryDTO {
    private Long id;
    private String reason;
    private Integer points;
    private String status;          // VALID/DELETED/CLEARED
    private LocalDateTime givenAt;
}
