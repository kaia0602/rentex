package com.rentex.rental.controller;

import com.rentex.rental.domain.RentalStatus;
import com.rentex.rental.dto.*;
import com.rentex.rental.service.RentalService;
import com.rentex.user.domain.User;
import com.rentex.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalService rentalService;
    private final UserService userService;

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

    /** 대여 요청 + 결제 (USER, ADMIN 가능) */
    @PostMapping("/request")
    public ResponseEntity<RentalPayResponseDto> requestAndPay(
            @RequestBody RentalRequestAndPayDto requestDto,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        User user = userService.getUserById(userId);
        RentalPayResponseDto response = rentalService.requestAndPay(requestDto, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** 요청 취소 (USER, ADMIN 가능) */
    @PatchMapping("/{rentalId}/cancel")
    public ResponseEntity<Void> cancelRental(
            @PathVariable Long rentalId,
            @RequestBody CancelRequestDto dto,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        User user = userService.getUserById(userId);
        rentalService.cancelRental(rentalId, user, dto.reason());
        return ResponseEntity.ok().build();
    }

    /** 요청 거절 (PARTNER, ADMIN 가능) */
    @PatchMapping("/{rentalId}/reject")
    public ResponseEntity<Void> rejectRental(
            @PathVariable Long rentalId,
            @RequestBody RejectRequestDto dto,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        User user = userService.getUserById(userId);
        rentalService.rejectRental(rentalId, user, dto.reason());
        return ResponseEntity.ok().build();
    }

    /** 대여 승인 (PARTNER, ADMIN 가능) */
    @PatchMapping("/{rentalId}/approve")
    public ResponseEntity<Void> approveRental(
            @PathVariable Long rentalId,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        User user = userService.getUserById(userId);
        rentalService.approveRental(rentalId, user);
        return ResponseEntity.ok().build();
    }

    /** 장비 배송 처리 (PARTNER, ADMIN 가능) */
    @PatchMapping("/{rentalId}/ship")
    public ResponseEntity<Void> shipRental(
            @PathVariable Long rentalId,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        User user = userService.getUserById(userId);
        rentalService.shipRental(rentalId, user);
        return ResponseEntity.ok().build();
    }

    /** 장비 수령 확인 (USER, ADMIN 가능) */
    @PatchMapping("/{rentalId}/receive")
    public ResponseEntity<Void> confirmReceiveRental(
            @PathVariable Long rentalId,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        User user = userService.getUserById(userId);
        rentalService.confirmReceiveRental(rentalId, user);
        return ResponseEntity.ok().build();
    }

    /** 반납 요청 (USER, ADMIN 가능) */
    @PatchMapping("/{rentalId}/return-request")
    public ResponseEntity<Void> requestReturn(
            @PathVariable Long rentalId,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        User user = userService.getUserById(userId);
        rentalService.requestReturn(rentalId, user);
        return ResponseEntity.ok().build();
    }

    /** 반납 완료 처리 (PARTNER, ADMIN 가능) */
    @PatchMapping("/{rentalId}/return")
    public ResponseEntity<Void> returnRental(
            @PathVariable Long rentalId,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        User user = userService.getUserById(userId);
        rentalService.returnRental(rentalId, user);
        return ResponseEntity.ok().build();
    }

    /** 내 대여 목록 조회 */
    @GetMapping("/me")
    public ResponseEntity<Page<RentalResponseDto>> getMyRentals(
            Principal principal,
            @RequestParam(required = false) RentalStatus status,
            Pageable pageable
    ) {
        Long userId = Long.parseLong(principal.getName());
        User user = userService.getUserById(userId);
        Page<RentalResponseDto> result = rentalService.getMyRentals(user, status, pageable);
        return ResponseEntity.ok(result);
    }

    /** 대여 상세 조회 (USER, ADMIN 공용) */
    @GetMapping("/{id}")
    public ResponseEntity<RentalResponseDto> getRentalDetail(
            @PathVariable Long id,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(rentalService.getRentalDetail(id, user));
    }

    /** 대여 히스토리 조회 — ✅ ID 기반으로 통일 */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<RentalHistoryResponseDto>> getHistory(
            @PathVariable Long id,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = Long.parseLong(principal.getName());
        User actor = userService.getUserById(userId);

        List<RentalHistoryResponseDto> history = rentalService.getRentalHistory(id, actor);
        return ResponseEntity.ok(history);
    }

    /** 파트너 전용: 본인 소속 아이템의 대여 요청 조회 */
    @GetMapping("/partner/requests")
    public ResponseEntity<Page<RentalResponseDto>> getPartnerRequests(
            Principal principal,
            @RequestParam(required = false) RentalStatus status,
            Pageable pageable
    ) {
        Long userId = Long.parseLong(principal.getName());
        User partner = userService.getUserById(userId);
        Page<RentalResponseDto> result = rentalService.getPartnerRentalRequests(partner, status, pageable);
        return ResponseEntity.ok(result);
    }

    /** 파트너 전용: 대여 상세 조회 */
    @GetMapping("/partner/{id}")
    public ResponseEntity<RentalResponseDto> getPartnerRentalDetail(
            @PathVariable Long id,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        User partner = userService.getUserById(userId);
        return ResponseEntity.ok(rentalService.getPartnerRentalDetail(id, partner));
    }

    /** 파트너 및 관리자용: 대여 상태 전체 보기 */
    @GetMapping("/partner/manage")
    public ResponseEntity<Page<RentalResponseDto>> getAllPartnerRentals(
            Principal principal,
            @RequestParam(required = false) RentalStatus status,
            Pageable pageable
    ) {
        Long userId = Long.parseLong(principal.getName());
        User loginUser = userService.getUserById(userId);
        Page<RentalResponseDto> rentals = rentalService.getAllPartnerRentals(loginUser, status, pageable);
        return ResponseEntity.ok(rentals);
    }

}
