package com.rentex.item.controller;

import com.rentex.item.dto.ItemResponseDTO;
import com.rentex.item.domain.Item;
import com.rentex.rental.service.RentalService;
import com.rentex.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 로그인 유저 전용 Item 조회 컨트롤러
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/items")
public class UserItemController {

    private final RentalService rentalService;

    /**
     * 현재 로그인한 유저가 대여한 장비 목록 조회
     *
     * @param user Spring Security 인증 객체 (로그인 유저)
     * @return ItemResponseDTO 리스트
     */
    @GetMapping("/my")
    public ResponseEntity<List<ItemResponseDTO>> getMyItems(@AuthenticationPrincipal User user) {
        // 1. 대여 이력에서 유저가 빌린 Item 목록 가져오기
        List<Item> items = rentalService.getItemsRentedByUser(user.getId());

        // 2. Item 엔티티 → ItemResponseDTO로 변환
        List<ItemResponseDTO> itemDTOs = items.stream()
                .map(ItemResponseDTO::fromEntity)
                .toList();

        // 3. 응답 반환
        return ResponseEntity.ok(itemDTOs);
    }
}
