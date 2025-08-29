package com.rentex.partner.controller;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.partner.dto.PartnerDashboardDTO;
import com.rentex.rental.service.RentalService;
import com.rentex.user.domain.User;
import com.rentex.user.dto.SignUpRequestDTO;
import com.rentex.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partners")
@RequiredArgsConstructor
public class PartnerController {

    private final UserService userService;
    private final RentalService rentalService;

    /** 파트너 생성 (회원가입 DTO에서 userType 확인 후 서버에서 role 결정) */
    @PostMapping
    public ResponseEntity<Long> create(@RequestBody SignUpRequestDTO dto) {
        // 서버가 결정: userType이 PARTNER이면 role = PARTNER, 아니면 USER
        if (!"PARTNER".equalsIgnoreCase(dto.getUserType())) {
            throw new IllegalArgumentException("파트너 회원만 생성할 수 있습니다.");
        }

        Long savedId = userService.signUp(dto);
        return ResponseEntity.ok(savedId);
    }
    /** 전체 파트너 조회 */
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAll() {
        return ResponseEntity.ok(userService.getUsersByRole("PARTNER"));
    }

    /** 단일 파트너 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (!"PARTNER".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.badRequest().build(); // PARTNER 아니면 에러
        }
        return ResponseEntity.ok(new UserResponseDTO(user));
    }

    /** 파트너 삭제 (탈퇴 처리) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.withdrawUser(id); // ✅ UserService 탈퇴 로직 재사용
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<PartnerDashboardDTO> getDashboard(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        Long partnerId = Long.parseLong(userDetails.getUsername());
        PartnerDashboardDTO dto = rentalService.getDashboard(partnerId);
        return ResponseEntity.ok(dto);
    }

    /** 등록 파트너 수 */
    @GetMapping("/count")
    public ResponseEntity<Long> countPartners() {
        long count = userService.countByRole("PARTNER");
        return ResponseEntity.ok(count);
    }

}
