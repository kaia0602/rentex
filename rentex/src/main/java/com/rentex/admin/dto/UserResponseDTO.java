package com.rentex.admin.dto;

import com.rentex.user.domain.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long id;
    private String email;
    private String name;
    private String nickname;
    private String role;
    private LocalDateTime createdAt;
    private int penaltyPoints;

    // PARTNER 전용 필드 (USER는 null)
    private String businessNo;
    private String contactEmail;
    private String contactPhone;

    // 생성자 (DB 값이 null일 경우 빈 문자열 처리)
    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.nickname = user.getNickname();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
        this.penaltyPoints = user.getPenaltyPoints();

        // PARTNER 전용 필드 null 처리
        this.businessNo = user.getBusinessNo() != null ? user.getBusinessNo() : "";
        this.contactEmail = user.getContactEmail() != null ? user.getContactEmail() : "";
        this.contactPhone = user.getContactPhone() != null ? user.getContactPhone() : "";
    }
}
