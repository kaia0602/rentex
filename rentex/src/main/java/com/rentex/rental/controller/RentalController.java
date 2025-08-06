package com.rentex.rental.controller;

import com.rentex.rental.domain.RentalStatus;
import com.rentex.rental.dto.*;
import com.rentex.rental.service.RentalService;
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
// import com.rentex.user.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/rentals")
public class RentalController {

    private final RentalService rentalService;
    private final UserRepository userRepository; // 테스트용 유저 주입용 (임시)

    // 대여 요청 생성 API
    // 상태: 생성 시 REQUESTED
    // 처리: Rental 생성, RentalHistory 기록
    // 현재는 인증 미적용 상태로 id = 1 유저 강제 주입
    // TODO: JWT 인증 적용 후 @AuthenticationPrincipal로 로그인 사용자 주입
      @PostMapping("/request")
    public ResponseEntity<Void> requestRental(@RequestBody RentalRequestDto requestDto) {
        User user = userRepository.findById(1L)
                .orElseThrow(() -> new IllegalArgumentException("테스트용 유저가 없습니다."));
        rentalService.requestRental(requestDto, user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 관리자 - 대여 승인 API
    // 상태: REQUESTED → APPROVED
    // 처리: 상태 변경, RentalHistory 기록
    @PatchMapping("/{rentalId}/approve")
    public ResponseEntity<Void> approveRental(@PathVariable Long rentalId) {
        rentalService.approveRental(rentalId);
        return ResponseEntity.ok().build();
    }

    // 파트너 - 장비 수령 확인 API
    // 상태: APPROVED → RENTED
    // 처리: 수령 시각 기록, 재고 차감, RentalHistory 기록
    @PatchMapping("/{rentalId}/start")
    public ResponseEntity<Void> startRental(@PathVariable Long rentalId) {
        rentalService.startRental(rentalId);
        return ResponseEntity.ok().build();
    }

    // 사용자 - 반납 요청 API
    // 상태: RENTED → RETURN_REQUESTED
    // 처리: 반납 요청 시각 기록, RentalHistory 기록
    @PatchMapping("/{rentalId}/return-request")
    public ResponseEntity<Void> requestReturn(@PathVariable Long rentalId) {
        rentalService.requestReturn(rentalId);
        return ResponseEntity.ok().build();
    }

    // 관리자 - 반납 완료 확인 API
    // 상태: RETURN_REQUESTED → RETURNED
    // 처리: 반납 시각 기록, 재고 복구, 벌점 부여 여부 판단, RentalHistory 기록
    @PatchMapping("/{rentalId}/return")
    public ResponseEntity<Void> returnRental(@PathVariable Long rentalId) {
        // adminUser를 DB에서 조회해서 강제 주입 (임시) 추후 변경
        // TODO: JWT 인증 적용 후 로그인된 관리자 정보로 대체
        User adminUser = userRepository.findByEmail("admin@rentex.com")
                .orElseThrow(() -> new IllegalArgumentException("관리자 계정을 찾을 수 없습니다."));

        rentalService.returnRental(rentalId, adminUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<List<RentalResponseDto>> getMyRentals(
            @RequestParam(required = false) RentalStatus status
    ) {
        // TODO: 인증 붙기 전까지 더미 유저 사용
        User user = userRepository.findById(1L)
                .orElseThrow(() -> new IllegalArgumentException("테스트 유저 없음"));

        List<RentalResponseDto> result = rentalService.getMyRentals(user, status);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public RentalDetailResponseDto getRentalDetail(
            @PathVariable Long id
            // @AuthenticationPrincipal User user
    ) {
        User user = userRepository.findById(1L)
                .orElseThrow(() -> new IllegalArgumentException("테스트 유저 없음"));

        return rentalService.getRentalDetail(id, user);
    }

    @GetMapping("/items/{itemId}/availability")
    public AvailabilityResponseDto checkItemAvailability(
            @PathVariable Long itemId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return rentalService.checkItemAvailability(itemId, startDate, endDate);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<RentalHistoryResponseDto>> getRentalHistory(@PathVariable Long id) {
        List<RentalHistoryResponseDto> history = rentalService.getRentalHistory(id);
        return ResponseEntity.ok(history);
    }

}
