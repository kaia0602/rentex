package com.rentex.admin.controller;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.admin.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/admin/users")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService userService) {
        this.adminService = userService;
    }

    @GetMapping
    public List<UserResponseDTO> getUsers() {
        return adminService.getAllUsers();
    }

}