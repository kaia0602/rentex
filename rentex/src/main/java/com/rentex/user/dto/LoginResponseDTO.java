package com.rentex.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDTO {
    private String accessToken;
    private Long userId;
    private String name;
    private String role;
}