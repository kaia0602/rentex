package com.rentex.rental.dto;

import com.rentex.payment.domain.Payment.PaymentMethod;
import java.time.LocalDate;

public record RentalRequestAndPayDto(
        Long itemId,
        LocalDate startDate,
        LocalDate endDate,
        int quantity,
        PaymentMethod method,
        int amount
) {}
