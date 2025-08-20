package com.rentex.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateRequestDTO {
    private String nickname;

    // 파트너 전용 필드
    private String businessNo;
    private String contactEmail;
    private String contactPhone;
    private String name;
}