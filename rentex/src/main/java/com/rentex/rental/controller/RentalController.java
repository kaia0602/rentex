package com.rentex.rental.controller;

import com.rentex.rental.domain.RentalStatus;
import com.rentex.rental.dto.*;
import com.rentex.rental.service.RentalService;
import com.rentex.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalService rentalService;

    /** 대여 가능 여부 확인 API */
    @GetMapping("/items/{itemId}/availability")
    public ResponseEntity<AvailabilityResponseDto> checkAvailability(
            @PathVariable Long itemId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        AvailabilityResponseDto dto = rentalService.checkAvailability(itemId, startDate, endDate);
        return ResponseEntity.ok(dto);
    }

    /** 대여 요청 (USER, ADMIN 가능) */
    @PostMapping("/request")
    public ResponseEntity<Void> requestRental(
            @RequestBody RentalRequestDto requestDto,
            @AuthenticationPrincipal User user
    ) {
        rentalService.requestRental(requestDto, user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /** 대여 승인 (PARTNER, ADMIN 가능) */
    @PatchMapping("/{rentalId}/approve")
    public ResponseEntity<Void> approveRental(
            @PathVariable Long rentalId,
            @AuthenticationPrincipal User user
    ) {
        rentalService.approveRental(rentalId, user);
        return ResponseEntity.ok().build();
    }

    /** 장비 수령 처리 (PARTNER, ADMIN 가능) */
    @PatchMapping("/{rentalId}/start")
    public ResponseEntity<Void> startRental(
            @PathVariable Long rentalId,
            @AuthenticationPrincipal User user
    ) {
        rentalService.startRental(rentalId, user);
        return ResponseEntity.ok().build();
    }

    /** 반납 요청 (USER, ADMIN 가능) */
    @PatchMapping("/{rentalId}/return-request")
    public ResponseEntity<Void> requestReturn(
            @PathVariable Long rentalId,
            @AuthenticationPrincipal User user
    ) {
        rentalService.requestReturn(rentalId, user);
        return ResponseEntity.ok().build();
    }

    /** 반납 완료 처리 (PARTNER, ADMIN 가능) */
    @PatchMapping("/{rentalId}/return")
    public ResponseEntity<Void> returnRental(
            @PathVariable Long rentalId,
            @AuthenticationPrincipal User user
    ) {
        rentalService.returnRental(rentalId, user);
        return ResponseEntity.ok().build();
    }

    /** 내 대여 목록 조회 */
    @GetMapping("/me")
    public ResponseEntity<Page<RentalResponseDto>> getMyRentals(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) RentalStatus status,
            Pageable pageable
    ) {
        Page<RentalResponseDto> result = rentalService.getMyRentals(user, status, pageable);
        return ResponseEntity.ok(result);
    }

    /** 대여 상세 조회 */
    @GetMapping("/{id}")
    public RentalDetailResponseDto getRentalDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return rentalService.getRentalDetail(id, user);
    }

    /** 대여 히스토리 조회 */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<RentalHistoryResponseDto>> getRentalHistory(@PathVariable Long id) {
        List<RentalHistoryResponseDto> history = rentalService.getRentalHistory(id);
        return ResponseEntity.ok(history);
    }
}
