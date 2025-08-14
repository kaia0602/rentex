package com.rentex.payment.dto;

import com.rentex.payment.domain.Payment;
import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record PaymentResponseDTO(
        Long id,
        int amount,
        String method,
        String status,
        LocalDateTime paidAt
) {
    public static PaymentResponseDTO from(Payment payment) {
        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .method(payment.getMethod().name())
                .status(payment.getStatus().name())
                .paidAt(payment.getPaidAt())
                .build();
    }
}