package com.rentex.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SimpleItemDTO {
    private Long id;
    private String name;
    private String thumbnailUrl;
    private String createdAt; // ISO 문자열로 내려주면 프론트 fmtDateTime 그대로 사용 가능
}
