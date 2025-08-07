package com.rentex.item.dto;

import com.rentex.item.domain.Item;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponseDTO {
    private Long id;
    private String name;
    private String description;
    private int stockQuantity;
    private String status;
    private Long partnerId;
    private String thumbnailUrl;
    private int dailyPrice;

    public static ItemResponseDTO fromEntity(Item item) {
        return ItemResponseDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .stockQuantity(item.getStockQuantity())
                .status(item.getStatus().name())
                .partnerId(item.getPartner().getId())
                .thumbnailUrl(item.getThumbnailUrl())
                .dailyPrice(item.getDailyPrice())
                .build();
    }
}