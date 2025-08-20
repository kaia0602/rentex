package com.rentex.user.domain;

import com.rentex.global.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
<<<<<<< HEAD
@Table(name = "user")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "role")
=======
@Table(name = "users") // ✅ 예약어 충돌 방지 위해 "users" 권장
>>>>>>> origin/feature/rentaladd
@SuperBuilder
@AllArgsConstructor
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    private String name;

    @Column(nullable = false, length = 20)
    private String nickname;

<<<<<<< HEAD
    @Column(name = "role", insertable = false, updatable = false)
    private String role;
=======
    // USER / PARTNER / ADMIN
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = "USER";
>>>>>>> origin/feature/rentaladd

    @Builder.Default
    private int penaltyPoints = 0;

    private LocalDateTime withdrawnAt;

    // ==== 이메일 인증 필드 추가 ====
    // ==== 향후 이메일 인증하지 않아도 ACTIVE로 변경하면 문제 없이 로그인 가능 ====
    @Enumerated(EnumType.STRING) // DB에 문자열로 저장
    @Builder.Default
    private UserStatus status = UserStatus.PENDING; // 기본 상태는 '인증 대기'

    // ==== JWT 토큰 인증으로 이메일 인증하는 기능 =====
    private String emailVerificationToken;

    private LocalDateTime tokenExpirationDate;

    // === Partner 전용 필드 ===
    @Column(length = 20, unique = true)
    private String businessNo;

    @Column(length = 100)
    private String contactEmail;

    @Column(length = 20)
    private String contactPhone;

    // ==== 생성자 (일반 유저 기본값) ====
    public User(String email, String password, String name, String nickname) {
        this(email, password, name, nickname, "USER");
    }

    public User(String email, String password, String name, String nickname, String role) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
<<<<<<< HEAD
        this.status = UserStatus.PENDING; // 명시적으로 상태 설정
    }

    // 이메일 인증 상태를 업데이트하는 메서드
    public void activateAccount() {
        this.status = UserStatus.ACTIVE;
        this.emailVerificationToken = null;
        this.tokenExpirationDate = null;
=======
        this.role = role;
>>>>>>> origin/feature/rentaladd
    }

    // ==== 업데이트 로직 ====
    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    // ==== 벌점 처리 ====
    public void addPenalty(int points) {
        this.penaltyPoints += points;
    }

    // ==== 탈퇴 처리 ====
    public void withdraw() {
        this.withdrawnAt = LocalDateTime.now();
    }

    public enum UserStatus {
        PENDING, // 인증 대기
        ACTIVE,  // 활성 (인증 완료)
        DISABLED // 비활성화 등
    }
}