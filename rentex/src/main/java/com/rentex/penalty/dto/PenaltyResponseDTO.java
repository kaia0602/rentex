package com.rentex.penalty.dto;

import com.rentex.penalty.domain.Penalty;
import lombok.Builder;

@Builder
public record PenaltyResponseDTO(int point, boolean paid) {
    public static PenaltyResponseDTO from(Penalty p) {
        return PenaltyResponseDTO.builder()
                .point(p.getPoint())
                .paid(p.isPaid())
                .build();
    }
}