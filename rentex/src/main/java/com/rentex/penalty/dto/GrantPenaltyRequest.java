package com.rentex.penalty.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GrantPenaltyRequest {
    private String reason;
    private Integer points;
}
