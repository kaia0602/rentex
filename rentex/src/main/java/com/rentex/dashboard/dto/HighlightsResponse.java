package com.rentex.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HighlightsResponse {
    private List<TopRentedItemDTO> topRentedItems;   // 최다 대여 장비 목록 (5개)
    private List<SimpleItemDTO> latestItems;         // 최근 등록 장비 목록 (5개)
}
