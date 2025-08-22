package com.rentex.item.controller;

import com.rentex.item.domain.Item;
import com.rentex.item.dto.ItemResponseDTO;
import com.rentex.rental.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/items")
public class UserItemController {

    private final RentalService rentalService;

    /** 내가 빌린 적 있는 아이템 목록 */
    @GetMapping("/my")
    public ResponseEntity<List<ItemResponseDTO>> getMyItems(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = Long.parseLong(userDetails.getUsername()); // principal.getName() == userId 문자열
        List<Item> items = rentalService.getItemsRentedByUser(userId);

        List<ItemResponseDTO> response = items.stream()
                .map(ItemResponseDTO::fromEntity) // 메서드명 맞춤
                .toList();

        return ResponseEntity.ok(response);
    }
}
