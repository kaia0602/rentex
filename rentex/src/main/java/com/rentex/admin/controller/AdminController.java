package com.rentex.admin.controller;

import com.rentex.admin.dto.AdminDashboardDTO;
import com.rentex.admin.dto.MonthlyUserDTO;
import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.admin.service.AdminService;
import com.rentex.rental.dto.RentalResponseDto;
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import com.rentex.rental.repository.RentalRepository;
import com.rentex.penalty.repository.PenaltyRepository;
import com.rentex.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000") // 프론트 주소에 맞게 수정
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    // ✅ FK 정리용 레포지토리 주입
    private final UserRepository userRepository;
    private final RentalRepository rentalRepository;
    private final PenaltyRepository penaltyRepository;

    /** 전체 사용자 조회 */
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    /** 역할별 조회 (USER / PARTNER / ADMIN) */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserResponseDTO>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(adminService.getUsersByRole(role));
    }

    /** 단일 사용자 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    /** 대시보드 통계 */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboardStats() {
        AdminDashboardDTO stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /** 월별 신규 회원 수 조회 */
    @GetMapping("/monthly-users")
    public List<MonthlyUserDTO> getMonthlyUsers(@RequestParam int year) {
        return userService.getMonthlyNewUsers(year);
    }

    /** ✅ 관리자 - 회원 강제 탈퇴 (물리 삭제) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> withdrawUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 사용자입니다."));

        // FK 참조 데이터 먼저 삭제
        rentalRepository.deleteByUser(user);
        penaltyRepository.deleteByUser(user);

        // 마지막으로 유저 삭제
        userRepository.delete(user);

        return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
    }

    /** ✅ 특정 사용자 대여내역 조회 */
    @GetMapping("/{id}/rents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RentalResponseDto>> getUserRents(@PathVariable Long id) {
        // userId 기반 대여내역 조회
        return ResponseEntity.ok(adminService.getUserRents(id));
    }

}
