package com.rentex.admin.controller;

import com.rentex.admin.dto.AdminDashboardDTO;
import com.rentex.admin.dto.MonthlyUserDTO;
import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.admin.service.AdminService;
import com.rentex.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000") // 프론트 주소에 맞게 수정
@RestController
@RequestMapping("/api/admin/users")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    public AdminController(AdminService adminService, UserService userService) {
        this.adminService = adminService;
        this.userService = userService;
    }

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

}
