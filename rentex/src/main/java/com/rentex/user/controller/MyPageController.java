package com.rentex.user.controller;

import com.rentex.penalty.domain.Penalty;
import com.rentex.penalty.service.PenaltyService;
import com.rentex.rental.domain.Rental;
import com.rentex.rental.service.RentalService;
import com.rentex.user.domain.User;
import com.rentex.user.dto.MyPageResponseDTO;
import com.rentex.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class MyPageController {

    private final UserService userService;
    private final RentalService rentalService;
    private final PenaltyService penaltyService;

    @GetMapping("/api/user/mypage")
    public ResponseEntity<MyPageResponseDTO> getMyPageInfo(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = Long.parseLong(authentication.getName());
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        List<Rental> allRentals = rentalService.findByUser(user);

        long rentalsInProgress = allRentals.stream()
                .filter(rental -> rental.getStatus() != null && "RENTED".equals(rental.getStatus().toString()))
                .count();

        boolean hasUnpaidPenalty = false;
        try {
            Penalty penalty = penaltyService.getPenaltyByUser(user);
            hasUnpaidPenalty = !penalty.isPaid();
        } catch (IllegalArgumentException e) {
            hasUnpaidPenalty = false;
        }

        List<MyPageResponseDTO.RecentRentalDTO> recentRentals = allRentals.stream()
                .limit(5)
                .map(rental -> {
                    String itemName = (rental.getItem() != null) ? rental.getItem().getName() : "알 수 없는 장비";
                    String period = "기간 정보 없음";
                    if (rental.getStartDate() != null && rental.getEndDate() != null) {
                        period = rental.getStartDate().format(DateTimeFormatter.ofPattern("MM-dd")) + " ~ " +
                                rental.getEndDate().format(DateTimeFormatter.ofPattern("MM-dd"));
                    }
                    String status = (rental.getStatus() != null) ? rental.getStatus().toString() : "상태 정보 없음";

                    return MyPageResponseDTO.RecentRentalDTO.builder()
                            .id(rental.getId())
                            .itemName(itemName)
                            .rentalPeriod(period)
                            .status(status)
                            .build();
                })
                .collect(Collectors.toList());

        MyPageResponseDTO response = MyPageResponseDTO.builder()
                .userName(user.getName())
                .summary(MyPageResponseDTO.SummaryDTO.builder()
                        .rentalsInProgress(rentalsInProgress)
                        .penalties(user.getPenaltyPoints())
                        .unpaidPenalty(hasUnpaidPenalty)
                        .build())
                .recentRentals(recentRentals)
                .build();

        return ResponseEntity.ok(response);
    }
}
