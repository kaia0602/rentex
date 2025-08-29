package com.rentex.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HighlightsResponse {
    private TopRentedItemDTO topRentedItem; // null 허용
    private SimpleItemDTO latestItem;       // null 허용
}
