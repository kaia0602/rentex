package com.rentex.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class LatestItemDTO {
    private Long itemId;
    private String name;
    private String thumbnailUrl;
    private LocalDateTime createdAt;
}
