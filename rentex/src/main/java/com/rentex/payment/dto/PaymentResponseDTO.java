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
        String type,              // RENTAL / PENALTY 구분 추가
        LocalDateTime paidAt
) {
    public static PaymentResponseDTO from(Payment payment) {
        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .method(payment.getMethod().name())
                .status(payment.getStatus().name())
                .type(payment.getType().name())     // PaymentType 매핑
                .paidAt(payment.getPaidAt())
                .build();
    }
}
