package com.rentex.user.controller;

import com.rentex.partner.domain.Partner;
import com.rentex.user.domain.User;
import com.rentex.user.dto.MyPageDTO;
import com.rentex.user.dto.ProfileDTO;
import com.rentex.user.dto.ProfileUpdateRequestDTO;
import com.rentex.user.dto.SignUpRequestDTO;
import com.rentex.user.service.UserService;
import com.rentex.user.dto.ProfileImageUpdateResponseDTO;
import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
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

        String phone = user.getContactPhone() != null ? user.getContactPhone() : "";

        ProfileDTO profile = new ProfileDTO(user.getName(), user.getNickname(), phone);

        return ResponseEntity.ok(profile);
    }

    @PostMapping("/me/profile-image")
    public ResponseEntity<ProfileImageUpdateResponseDTO> updateUserProfileImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("profileImage") MultipartFile profileImage) throws IOException {

        Long userId = Long.parseLong(userDetails.getUsername());
        User updatedUser = userService.updateProfileImage(userId, profileImage);

        return ResponseEntity.ok(new ProfileImageUpdateResponseDTO(updatedUser.getProfileImageUrl()));
    }


    @Getter
    @NoArgsConstructor
    static class ProfileImageUrlUpdateRequest {
        private String url;
    }

    @PatchMapping("/me/profile-image")
    public ResponseEntity<Void> updateProfileImageUrlByUrl(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileImageUrlUpdateRequest request) {

        Long userId = Long.parseLong(userDetails.getUsername());
        userService.updateProfileImageUrl(userId, request.getUrl());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me/profile-image")
    public ResponseEntity<Void> deleteProfileImage(@AuthenticationPrincipal UserDetails userDetails) {

        Long userId = Long.parseLong(userDetails.getUsername());
        userService.deleteProfileImage(userId);
        return ResponseEntity.noContent().build();
    }
}
