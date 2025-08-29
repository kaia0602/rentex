package com.rentex.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record ActivityDTO(
        Long id,
        Long rentalId,
        String itemName,
        String actor,
        String type,  // REQUESTED, APPROVED, RENTED, RETURNED 등
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime occurredAt
) {}
