package com.rentex.penalty.controller;

import com.rentex.penalty.dto.PenaltyResponseDTO;
import com.rentex.penalty.service.PenaltyService;
import com.rentex.user.domain.User;
import com.rentex.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/penalties")
@RequiredArgsConstructor
public class PenaltyController {

    private final PenaltyService penaltyService;
    private final UserService userService;

    // 사용자 본인 벌점 조회
    @GetMapping("/me")
    public PenaltyResponseDTO getMyPenalty(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return PenaltyResponseDTO.from(penaltyService.getPenaltyByUser(user));
    }

    // 관리자 벌점 초기화
    @PostMapping("/reset/{userId}")
    public ResponseEntity<Void> resetPenalty(@PathVariable Long userId) {
        penaltyService.resetPenaltyByUserId(userId);
        return ResponseEntity.ok().build();
    }

    // 관리자 벌점 증가
    @PostMapping("/increase/{userId}")
    public ResponseEntity<Void> increasePenalty(@PathVariable Long userId, @RequestParam int score) {
        penaltyService.increasePenalty(userId, score);
        return ResponseEntity.ok().build();
    }
}