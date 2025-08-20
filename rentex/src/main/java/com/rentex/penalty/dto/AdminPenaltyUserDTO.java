package com.rentex.penalty.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminPenaltyUserDTO {
    private Long userId;
    private String name;
    private String email;
    private Integer penaltyPoints;
    private Integer activeEntries;  // VALID 개수
    private LocalDateTime lastGivenAt;
}
