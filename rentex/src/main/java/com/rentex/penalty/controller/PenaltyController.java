package com.rentex.penalty.controller;

import com.rentex.penalty.dto.PenaltyResponseDTO;
import com.rentex.penalty.service.PenaltyService;
import com.rentex.user.domain.User;
import com.rentex.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/penalties")
@RequiredArgsConstructor
public class PenaltyController {

    private final PenaltyService penaltyService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyPenalty(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).body(Map.of(
                    "error", "UNAUTHORIZED",
                    "message", "로그인이 필요합니다."
            ));
        }
        String email = auth.getName(); // 기본값: 인증 주체의 name
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(PenaltyResponseDTO.from(penaltyService.getPenaltyByUser(user)));
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