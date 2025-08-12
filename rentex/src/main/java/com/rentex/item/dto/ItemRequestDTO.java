package com.rentex.item.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ItemRequestDTO {
    private String name;
    private String description;
    private int stockQuantity;
    private int dailyPrice;
    private String status; // 예: "AVAILABLE", "UNAVAILABLE"
    private Long partnerId;
    private Long categoryId;      // 대분류 카테고리 ID
    private Long subCategoryId;   // 소분류 카테고리 ID
//    private MultipartFile thumbnailUrl;
}