package com.rentex.admin.dto;

import com.rentex.user.domain.User;
import lombok.*;

import java.time.LocalDateTime;

@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class UserResponseDTO {
    private Long id;
    private String email;
    private String name;
    private String nickname;
    private String role;
    private LocalDateTime createdAt;
    private int penaltyPoints;

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.nickname = user.getNickname();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
        this.penaltyPoints = user.getPenaltyPoints();

    }
}
