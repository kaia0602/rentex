package com.rentex.rental.dto;
import com.rentex.rental.domain.RentalStatus;

public record RentalPayResponseDto(Long rentalId, Long paymentId, RentalStatus status) {}

