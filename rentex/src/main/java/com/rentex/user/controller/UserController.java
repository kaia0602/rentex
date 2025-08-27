package com.rentex.user.controller;

import com.rentex.common.upload.ProfileImageUploadService;
import com.rentex.user.dto.MyPageDTO;
import com.rentex.user.dto.ProfileUpdateRequestDTO;
import com.rentex.user.service.UserService;
import com.rentex.user.dto.SignUpRequestDTO;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;
    private final ProfileImageUploadService profileImageUploadService;

    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody SignUpRequestDTO requestDTO) {
        try {
            userService.signUp(requestDTO);
            return ResponseEntity.ok("회원가입이 성공적으로 완료되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me") // ✅ /me/profile -> /me 로 변경 (더 일반적)
    @PreAuthorize("isAuthenticated()") // 로그인한 모든 사용자가 접근 가능
    public ResponseEntity<MyPageDTO> getMyPage(@AuthenticationPrincipal UserDetails userDetails) {
        // 1. @AuthenticationPrincipal을 통해 현재 로그인한 사용자의 ID를 가져옴
        Long userId = Long.parseLong(userDetails.getUsername());

        // 2. 서비스 호출
        MyPageDTO myPageInfo = userService.getMyPageInfo(userId);

        // 3. DTO 응답
        return ResponseEntity.ok(myPageInfo);
    }

    // ✅ 회원 정보 API 추가
    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileUpdateRequestDTO requestDTO) {

        Long userId = Long.parseLong(userDetails.getUsername());
        userService.updateProfile(userId, requestDTO);

        return ResponseEntity.ok("프로필 정보가 성공적으로 업데이트되었습니다.");
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> withdrawAccount(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = Long.parseLong(userDetails.getUsername());
            userService.withdrawUser(userId);
            return ResponseEntity.ok("회원 탈퇴가 성공적으로 처리되었습니다.");
        } catch (IllegalStateException e) {
            // 서비스에서 발생시킨 예외를 잡아 사용자에게 친절한 메시지 전달
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 유저 프로필 이미지 수정 관련 내용
    // 프로필 이미지 업로드(파일 업로드)
    @PostMapping("/me/profile-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> uploadProfileImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {

        Long userId = Long.parseLong(userDetails.getUsername());
        String imageUrl = profileImageUploadService.uploadAndResize(file);

        // 업로드된 이미지 URL로 사용자 정보 업데이트
        userService.updateProfileImageUrl(userId, imageUrl);

        return ResponseEntity.status(HttpStatus.CREATED).body(imageUrl);
    }

    // URL로 프로필 이미지 URL 업데이트
    @PatchMapping("/me/profile-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> updateProfileImageUrl(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileImageUrlUpdateRequest request) { // 요청 본문에서 URL 받음

        Long userId = Long.parseLong(userDetails.getUsername());
        userService.updateProfileImageUrl(userId, request.getUrl());

        return ResponseEntity.ok("프로필 이미지 URL이 성공적으로 변경되었습니다.");
    }

    // ✅ DTO 클래스 추가
    @Getter
    @NoArgsConstructor
    static class ProfileImageUrlUpdateRequest {
        private String url;
    }

    // 프로필 이미지 삭제
    @DeleteMapping("/me/profile-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteProfileImage(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        userService.deleteProfileImage(userId);
        return ResponseEntity.noContent().build();
    }

}