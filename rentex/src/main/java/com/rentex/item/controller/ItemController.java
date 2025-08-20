package com.rentex.item.controller;

import com.rentex.item.dto.ItemRequestDTO;
import com.rentex.item.dto.ItemResponseDTO;
import com.rentex.item.repository.ItemRepository;
import com.rentex.item.service.ItemService;
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000") // 🚀 배포 시: https://rentex.site 도메인으로 변경 필요
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/partner/items")
public class ItemController {

    private final ItemService itemService;

    private final UserRepository userRepository;

    private final ItemRepository itemRepository;

    // 전체 아이템 조회
    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getMyItems(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // username이 userId로 들어온 경우
        Long userId = Long.parseLong(userDetails.getUsername());
        User partner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("로그인된 파트너를 찾을 수 없습니다."));

        List<ItemResponseDTO> items = itemService.getItemsByPartnerId(partner.getId());
        return ResponseEntity.ok(items);
    }
    // 특정 파트너 소속 아이템 조회
    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByPartner(@PathVariable Long partnerId) {
        List<ItemResponseDTO> items = itemService.getItemsByPartnerId(partnerId);
        return ResponseEntity.ok(items);
    }

    // 아이템 등록 (썸네일 + 상세 이미지 + DTO 함께 전달)
    @PostMapping(value = "/new", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> registerItem(
            @RequestPart ItemRequestDTO dto,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart(value = "detailImages", required = false) List<MultipartFile> detailImages,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // JWT subject가 userId이므로 Long으로 변환
        Long userId = Long.valueOf(userDetails.getUsername());

        User partner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("로그인된 파트너를 찾을 수 없습니다."));

        dto.setPartnerId(partner.getId()); // DTO에 partnerId 자동 세팅

        itemService.registerItem(dto, thumbnail, detailImages);
        return ResponseEntity.ok().build();
    }

    // 단일 아이템 조회
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDTO> getItem(@PathVariable Long id) {
        ItemResponseDTO dto = itemService.getItemById(id);
        return ResponseEntity.ok(dto);
    }

    // 아이템 수정 (썸네일 + 상세 이미지 + DTO 함께 전달)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> updateItem(
            @PathVariable Long id,
            @RequestPart("item") ItemRequestDTO dto,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart(value = "detailImages", required = false) List<MultipartFile> detailImages
            // ✅ 기존 썸네일/상세이미지 변경 시에도 /uploads/ 경로로 접근 가능하게 저장됨
    ) {
        if (id == null) {
            throw new IllegalArgumentException("id must not be null");
        }

        itemService.updateItem(id, dto, thumbnail, detailImages);
        return ResponseEntity.ok().build();
    }

    // 아이템 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getMyItemCount(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User partner = userRepository.findById(Long.parseLong(userDetails.getUsername()))
                .orElseThrow(() -> new IllegalArgumentException("로그인된 파트너를 찾을 수 없습니다."));

        Long count = itemRepository.countByPartnerId(partner.getId());
        return ResponseEntity.ok(count);
    }
}
