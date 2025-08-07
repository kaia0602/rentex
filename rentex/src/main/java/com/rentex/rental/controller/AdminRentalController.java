package com.rentex.rental.controller;

import com.rentex.rental.domain.RentalStatus;
import com.rentex.rental.dto.RentalResponseDto;
import com.rentex.rental.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/rentals")
public class AdminRentalController {

    private final RentalService rentalService;

    @GetMapping
    public ResponseEntity<Page<RentalResponseDto>> getAllRentals(
            @RequestParam(required = false) RentalStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<RentalResponseDto> result = rentalService.getAllRentals(status, pageable);
        return ResponseEntity.ok(result);
    }
}
