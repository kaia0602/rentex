package com.rentex.penalty.controller;

import com.rentex.penalty.dto.MyPenaltyResponseDTO;
import com.rentex.penalty.dto.PenaltyWithRentalDTO;
import com.rentex.penalty.service.PenaltyService;
import com.rentex.user.domain.User;
import com.rentex.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/penalties")
@RequiredArgsConstructor
public class PenaltyController {

    private final PenaltyService penaltyService;
    private final UserService userService;

    /** 내 벌점 조회 */
    @GetMapping("/me")
    public ResponseEntity<?> getMyPenalty(Authentication auth) {
        if (isAnonymous(auth)) {
            return unauthorizedResponse();
        }
        Long userId = Long.parseLong(auth.getName());
        User user = userService.getUserById(userId);

        // 서비스에서 DTO 만들어서 반환
        MyPenaltyResponseDTO dto = penaltyService.getMyPenalties(user);

        return ResponseEntity.ok(dto);
    }

    /** ✅ 관리자 벌점 초기화 */
    @PostMapping("/reset/{userId}")
    public ResponseEntity<Void> resetPenalty(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        penaltyService.resetPenalty(user);
        return ResponseEntity.ok().build();
    }

    /** ✅ 관리자 벌점 증가 */
    @PostMapping("/increase/{userId}")
    public ResponseEntity<Void> increasePenalty(@PathVariable Long userId, @RequestParam int point) {
        User user = userService.getUserById(userId);
        penaltyService.increasePenalty(user, point);
        return ResponseEntity.ok().build();
    }

    // -------------------- Private Helper --------------------
    private boolean isAnonymous(Authentication auth) {
        return auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken;
    }

    private ResponseEntity<Map<String, String>> unauthorizedResponse() {
        return ResponseEntity.status(401).body(Map.of(
                "error", "UNAUTHORIZED",
                "message", "로그인이 필요합니다."
        ));
    }
}
