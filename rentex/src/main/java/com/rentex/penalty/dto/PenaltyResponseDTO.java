package com.rentex.penalty.dto;

import com.rentex.penalty.domain.Penalty;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record PenaltyResponseDTO(int point, boolean paid, LocalDateTime createdAt) {
    public static PenaltyResponseDTO from(Penalty p) {
        return PenaltyResponseDTO.builder()
                .point(p.getPoint())
                .paid(p.isPaid())
                .createdAt(p.getCreatedAt())
                .build();
    }
}