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

    /** ✅ 관리자 - 회원 탈퇴 처리 */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> withdrawUser(@PathVariable Long id) {
        adminService.withdrawUser(id); // 소프트 삭제로 변경
        return ResponseEntity.noContent().build(); // 204
    }

    /** ✅ 특정 사용자 대여내역 조회 */
    @GetMapping("/{id}/rents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RentalResponseDto>> getUserRents(@PathVariable Long id) {
        // userId 기반 대여내역 조회
        return ResponseEntity.ok(adminService.getUserRents(id));
    }

}
