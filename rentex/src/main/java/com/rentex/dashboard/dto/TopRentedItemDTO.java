package com.rentex.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopRentedItemDTO {
    private Long itemId;
    private String name;
    private String thumbnailUrl;
    private long rentCountRecent7d;
}
