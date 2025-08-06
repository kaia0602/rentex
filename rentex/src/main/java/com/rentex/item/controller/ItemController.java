package com.rentex.item.controller;

import com.rentex.item.dto.ItemRequestDTO;
import com.rentex.item.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/items")
public class ItemController {

    private final ItemService itemService;

    @PostMapping("/new")
    public ResponseEntity<Void> registerItem(@RequestBody ItemRequestDTO dto,  @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        itemService.registerItem(dto, thumbnail);
        return ResponseEntity.ok().build();
    }
}
