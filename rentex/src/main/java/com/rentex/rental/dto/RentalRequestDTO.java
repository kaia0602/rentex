package com.rentex.rental.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RentalRequestDTO {
    private Long itemId;
    private int quantity;
    // 필요하다면 대여 시작일, 종료일 등의 필드 추가
}