package com.rentex.penalty.controller;

import com.rentex.penalty.service.PenaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me")
public class PenaltyController {

    private final PenaltyService penaltyService;

    @GetMapping("/penalties")
    public ResponseEntity<Integer> getPenalty() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(penaltyService.getPenaltyPoint(userId));
    }

    @PostMapping("/pay-penalty")
    public ResponseEntity<String> payPenalty() {
        Long userId = getCurrentUserId();
        penaltyService.payPenalty(userId);
        return ResponseEntity.ok("벌점이 초기화되었습니다.");
    }

    private Long getCurrentUserId() {
        return 1L; // TODO: JWT 연동 시 실제 유저 ID로 대체
    }
}
