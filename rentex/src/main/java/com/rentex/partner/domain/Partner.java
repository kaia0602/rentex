package com.rentex.partner.domain;

import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "partners")
@DiscriminatorValue("PARTNER") // 3. 이 엔티티는 역할(DTYPE)이 'PARTNER'인 경우
public class Partner extends User {

    @Column(nullable = false, unique = true, length = 20)
    private String businessNo;

    @Column(length = 100)
    private String contactEmail;

    @Column(length = 20)
    private String contactPhone;

    @Builder
    public Partner(String email, String password, String name, String nickname,
                   String businessNo, String contactEmail, String contactPhone) {
        super(email, password, name, nickname); // 부모 생성자 호출
        this.businessNo = businessNo;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
    }
}