package com.rentex.rental.controller;

import com.rentex.rental.service.RentalService;
import lombok.RequiredArgsConstructor;
import com.rentex.rental.dto.RentalRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @PostMapping("/{rentalId}/return-request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> requestReturn(
            @PathVariable Long rentalId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = Long.parseLong(userDetails.getUsername());
        rentalService.requestReturn(rentalId, userId);

        return ResponseEntity.ok("반납 요청이 성공적으로 처리되었습니다.");
    }


    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createRental(
            @RequestBody RentalRequestDTO requestDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = Long.parseLong(userDetails.getUsername());
            rentalService.createRental(requestDTO, userId);
            return ResponseEntity.ok("대여 요청이 성공적으로 완료되었습니다.");
        } catch (IllegalStateException e) {
            // ✅ 서비스에서 발생시킨 '대여 불가' 예외를 잡아 403 Forbidden 응답으로 처리
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}