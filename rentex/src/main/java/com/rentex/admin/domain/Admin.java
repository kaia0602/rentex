package com.rentex.admin.domain;

import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "admin")
@DiscriminatorValue("ADMIN") // 3. 이 엔티티는 역할(DTYPE)이 'ADMIN'인 경우
public class Admin extends User {

    @Enumerated(EnumType.STRING)
    private AdminRole adminRole; // SUPER_ADMIN, MANAGER

    @Builder
    public Admin(String email, String password, String name, String nickname, AdminRole adminRole) {
        super(email, password, name, nickname); // 부모 생성자 호출
        this.adminRole = adminRole;
    }
}