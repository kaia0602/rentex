//package com.rentex.user.controller;
//
//import com.rentex.penalty.domain.Penalty;
//import com.rentex.penalty.service.PenaltyService;
//import com.rentex.rental.domain.Rental;
//import com.rentex.rental.service.RentalService;
//import com.rentex.user.domain.User;
//import com.rentex.user.dto.MyPageResponseDTO;
//import com.rentex.user.service.UserService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.time.format.DateTimeFormatter;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@RestController
//@RequiredArgsConstructor
//public class MyPageController {
//
//    private final UserService userService;
//    private final RentalService rentalService;
//    private final PenaltyService penaltyService;
//
//    @GetMapping("/api/user/mypage")
//    public ResponseEntity<MyPageResponseDTO> getMyPageInfo(Authentication authentication) {
//        if (authentication == null || !authentication.isAuthenticated()) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//
//        Long userId = Long.parseLong(authentication.getName());
//        User user = userService.findById(userId)
//                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
//
//        // 1. 특정 사용자의 모든 대여 내역을 ID 기반으로 조회합니다.
//        List<Rental> allRentals = rentalService.findByUserId(userId);
//
//        // 2. 현재 대여 중인 내역의 수를 계산합니다.
//        long rentalsInProgress = allRentals.stream()
//                .filter(rental -> rental.getStatus() != null && "RENTED".equals(rental.getStatus().toString()))
//                .count();
//
//        // 3. 미납된 벌점이 있는지 확인합니다.
//        boolean hasUnpaidPenalty = false;
//        try {
//            List<Penalty> penalties = penaltyService.getPenaltiesByUser(user);
//            hasUnpaidPenalty = penalties.stream()
//                    .anyMatch(penalty -> !penalty.isPaid());
//        } catch (IllegalArgumentException e) {
//            hasUnpaidPenalty = false;
//        }
//
//        // 4. 최근 대여 내역 5개를 DTO로 변환합니다.
//        List<MyPageResponseDTO.RecentRentalDTO> recentRentals = allRentals.stream()
//                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt())) // 최신순 정렬
//                .limit(5)
//                .map(rental -> {
//                    String itemName = (rental.getItem() != null) ? rental.getItem().getName() : "알 수 없는 장비";
//                    String period = "기간 정보 없음";
//                    if (rental.getStartDate() != null && rental.getEndDate() != null) {
//                        period = rental.getStartDate().format(DateTimeFormatter.ofPattern("MM-dd")) + " ~ " +
//                                rental.getEndDate().format(DateTimeFormatter.ofPattern("MM-dd"));
//                    }
//                    String status = (rental.getStatus() != null) ? rental.getStatus().toString() : "상태 정보 없음";
//
//                    return MyPageResponseDTO.RecentRentalDTO.builder()
//                            .id(rental.getId())
//                            .itemName(itemName)
//                            .rentalPeriod(period)
//                            .status(status)
//                            .build();
//                })
//                .collect(Collectors.toList());
//
//        // 5. 모든 정보를 담은 최종 DTO를 반환합니다.
//        MyPageResponseDTO response = MyPageResponseDTO.builder()
//                .userName(user.getName())
//                .summary(MyPageResponseDTO.SummaryDTO.builder()
//                        .rentalsInProgress(rentalsInProgress)
//                        .penalties(user.getPenaltyPoints())
//                        .unpaidPenalty(hasUnpaidPenalty)
//                        .build())
//                .recentRentals(recentRentals)
//                .build();
//
//        return ResponseEntity.ok(response);
//    }
//}