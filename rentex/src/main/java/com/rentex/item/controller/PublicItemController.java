package com.rentex.item.controller;

import com.rentex.item.dto.ItemResponseDTO;
import com.rentex.item.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/items") // 공용 경로
public class PublicItemController {

    private final ItemService itemService; // 서비스 주입

    // 전체 아이템 목록 조회 (공용)
    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    // 개별 아이템 상세 조회 (공용)
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDTO> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }
}
