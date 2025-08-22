// PaymentDetailDTO.java
package com.rentex.payment.dto;

import com.rentex.payment.domain.Payment;
import com.rentex.rental.domain.Rental;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
public record PaymentDetailDTO(
        Long id,
        String type,          // RENTAL | PENALTY
        String status,        // SUCCESS | PENDING | FAILED
        int amount,
        LocalDateTime paidAt,

        // RENTAL 전용
        Long rentalId,
        String itemName,
        LocalDate rentalStartDate,
        LocalDate rentalEndDate
) {
    public static PaymentDetailDTO from(Payment p) {
        Rental r = p.getRental();
        return PaymentDetailDTO.builder()
                .id(p.getId())
                .type(p.getType().name())
                .status(p.getStatus().name())
                .amount(p.getAmount())
                .paidAt(p.getPaidAt())
                .rentalId(r != null ? r.getId() : null)
                .itemName(r != null && r.getItem() != null ? r.getItem().getName() : null)
                .rentalStartDate(r != null ? r.getStartDate() : null)
                .rentalEndDate(r != null ? r.getEndDate() : null)
                .build();
    }
}
