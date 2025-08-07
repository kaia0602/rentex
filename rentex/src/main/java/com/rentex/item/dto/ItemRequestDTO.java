package com.rentex.item.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

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
//  private String thumbnailUrl; // S3 업로드 후 URL
}