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

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/partner/items")
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getAllItems() {
        List<ItemResponseDTO> items = itemService.getAllItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<List<ItemResponseDTO>> getItemsByPartner(@PathVariable Long partnerId) {
        List<ItemResponseDTO> items = itemService.getItemsByPartnerId(partnerId);
        return ResponseEntity.ok(items);
    }

    @PostMapping(value = "/new", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> registerItem(
            @RequestPart ItemRequestDTO dto,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail)
    {
        itemService.registerItem(dto, thumbnail);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDTO> getItem(@PathVariable Long id) {
        ItemResponseDTO dto = itemService.getItemById(id);
        return ResponseEntity.ok(dto);
    }


    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> updateItem(
            @PathVariable Long id,
            @RequestPart("item") ItemRequestDTO dto, // JSON 데이터
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail // 이미지 파일
    ) {

        if (id == null) {
            throw new IllegalArgumentException("id must not be null");
        }

        itemService.updateItem(id, dto, thumbnail);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
