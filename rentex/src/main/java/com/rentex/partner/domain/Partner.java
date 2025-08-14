package com.rentex.partner.domain;

import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
<<<<<<< HEAD
=======
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
>>>>>>> origin/feature/admin-items

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
<<<<<<< HEAD
@Table(name = "partner")
@DiscriminatorValue("PARTNER") // 3. 이 엔티티는 역할(DTYPE)이 'PARTNER'인 경우
public class Partner extends User {

    @Column(nullable = false, unique = true, length = 20)
=======
@SuperBuilder // User 빌더 필드까지 상속
@DiscriminatorValue("PARTNER") // JOINED 전략 구분값
public class Partner extends User {

    @Column(name = "business_no", length = 20, unique = true)
>>>>>>> origin/feature/admin-items
    private String businessNo;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
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