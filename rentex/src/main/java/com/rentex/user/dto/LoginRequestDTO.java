package com.rentex.user.dto; // 공통으로 사용될 수 있으니 global.dto로 옮겨도 좋습니다.

import lombok.Getter;

@Getter
public class LoginRequestDTO {
    private String email;
    private String password;
}