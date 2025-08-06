package com.rentex.item.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemRequestDTO {
    private String name;
    private String description;
    private int stockQuantity;
    private String status;       // "AVAILABLE" or "UNAVAILABLE"
    private Long partnerId;
}
