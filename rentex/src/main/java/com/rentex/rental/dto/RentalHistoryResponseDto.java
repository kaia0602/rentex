package com.rentex.rental.dto;

import com.rentex.rental.domain.ActionActor;
import com.rentex.rental.domain.RentalStatus;

import java.time.LocalDateTime;

public record RentalHistoryResponseDto(
        RentalStatus fromStatus,
        RentalStatus toStatus,
        ActionActor actor,
        String message,
        LocalDateTime createdAt
) {}
