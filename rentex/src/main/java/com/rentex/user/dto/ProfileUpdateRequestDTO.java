package com.rentex.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProfileUpdateRequestDTO {

    private String name;

    private String nickname;

    @JsonProperty("contact_phone")
    private String contactPhone;

    @JsonProperty("contact_email")
    private String contactEmail;

    @JsonProperty("business_no")
    private String businessNo;
}