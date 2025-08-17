package com.rentex.user.controller;

import com.rentex.partner.domain.Partner;
import com.rentex.user.domain.User;
import com.rentex.user.dto.MyPageDTO;
import com.rentex.user.dto.ProfileDTO;
import com.rentex.user.dto.ProfileUpdateRequestDTO;
import com.rentex.user.dto.SignUpRequestDTO;
import com.rentex.user.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody SignUpRequestDTO requestDTO) {
        try {
            userService.signUp(requestDTO);
            return ResponseEntity.ok("Sign-up completed successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MyPageDTO> getMyPage(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        MyPageDTO myPageInfo = userService.getMyPageInfo(userId);
        return ResponseEntity.ok(myPageInfo);
    }

    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<String> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileUpdateRequestDTO requestDTO) {

        Long userId = Long.parseLong(userDetails.getUsername());
        userService.updateProfile(userId, requestDTO);

        return ResponseEntity.ok("Profile information has been updated successfully.");
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> withdrawAccount(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = Long.parseLong(userDetails.getUsername());
            userService.withdrawUser(userId);
            return ResponseEntity.ok("Account withdrawal has been processed successfully.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDTO> getUserProfile(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String phone = "";
        // Check if the retrieved user object is an instance of the Partner class
        if (user instanceof Partner partner) {
            // Get contactPhone after casting to Partner
            phone = partner.getContactPhone() != null ? partner.getContactPhone() : "";
        }

        ProfileDTO profile = new ProfileDTO(user.getName(), user.getNickname(), phone);

        return ResponseEntity.ok(profile);
    }
}
