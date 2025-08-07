package com.rentex.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignUpRequestDTO {
    // 공통 정보
    private String email;
    private String password;
    private String name;
    private String nickname;

    // 사용자 타입 구분 ( "USER" 또는 "PARTNER" )
    private String userType;

    // 파트너 전용 정보 ( userType이 'PARTNER'일 때만 사용 )
    private String businessNo;
    private String contactEmail;
    private String contactPhone;
}