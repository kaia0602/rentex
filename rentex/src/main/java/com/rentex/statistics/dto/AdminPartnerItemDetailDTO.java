package com.rentex.statistics.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminPartnerItemDetailDTO {
    private Long itemId;
    private String itemName;
    private Long quantity;
    private Long unitPrice;
    private Long days;
    private Long amount;
}
