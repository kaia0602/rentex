<<<<<<< HEAD
package com.rentex.partner.domain;

import com.rentex.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder // User 빌더 필드까지 상속
@DiscriminatorValue("PARTNER") // JOINED 전략 구분값
public class Partner extends User {

    @Column(name = "business_no", length = 20, unique = true)
    private String businessNo;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
=======
//package com.rentex.partner.domain;
//
//import com.rentex.user.domain.User;
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.SuperBuilder;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Getter
//@NoArgsConstructor(access = AccessLevel.PROTECTED)
//@SuperBuilder // User 빌더 필드까지 상속
//@DiscriminatorValue("PARTNER") // JOINED 전략 구분값
//public class Partner extends User {
//
//    @Column(name = "business_no", length = 20, unique = true)
//    private String businessNo;
//
//    @Column(name = "contact_email", length = 100)
//    private String contactEmail;
//
//    @Column(name = "contact_phone", length = 20)
//    private String contactPhone;
//
//    @CreationTimestamp
//    private LocalDateTime createdAt;
//
//    @UpdateTimestamp
//    private LocalDateTime updatedAt;
//}
>>>>>>> origin/feature/rentaladd
