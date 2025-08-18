package com.rentex.item.controller;

import com.rentex.item.dto.ItemRequestDTO;
import com.rentex.item.dto.ItemResponseDTO;
import com.rentex.item.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000") // 🚀 배포 시: https://rentex.site 도메인으로 변경 필요
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/partner/items")
public class ItemController {

    private final ItemService itemService;

    // 전체 아이템 조회
    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getAllItems() {
        List<ItemResponseDTO> items = itemService.getAllItems();
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
            @RequestPart(value = "detailImages", required = false) List<MultipartFile> detailImages
            // ✅ 저장된 이미지들은 /uploads/파일명 형태의 URL로 반환됨 → 프론트에서 그대로 img src로 사용 가능
    ) {
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
}
