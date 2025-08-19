package com.rentex.partner.controller;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.user.domain.User;
import com.rentex.user.dto.SignUpRequestDTO;
import com.rentex.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners")
@RequiredArgsConstructor
public class PartnerController {

    private final UserService userService;

    /** 파트너 생성 (회원가입 시 role = PARTNER 강제 세팅) */
//    @PostMapping
//    public ResponseEntity<Long> create(@RequestBody SignUpRequestDTO dto) {
//        dto.setUserType("PARTNER"); // ✅ role 강제 지정
//        Long savedId = userService.signUp(dto);
//        return ResponseEntity.ok(savedId);
//    }

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody SignUpRequestDTO dto) {
        // 프론트에서 이미 role = PARTNER 로 들어오므로 강제 지정 제거
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
}
