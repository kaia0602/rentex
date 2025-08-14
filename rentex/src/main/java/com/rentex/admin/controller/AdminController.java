package com.rentex.admin.controller;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.admin.service.AdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService userService) {
        this.adminService = userService;
    }

    @GetMapping("/api/admin/users")
    public List<UserResponseDTO> getUsers() {
        return adminService.getAllUsers();
    }
}