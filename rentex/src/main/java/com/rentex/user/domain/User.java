package com.rentex.user.domain;

import com.rentex.global.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "role")
@SuperBuilder
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

    @Column(name = "role", insertable = false, updatable = false)
    private String role;

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

    // ==== 생성자 ====
    public User(String email, String password, String name, String nickname) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
        this.status = UserStatus.PENDING; // 명시적으로 상태 설정
    }

    // 이메일 인증 상태를 업데이트하는 메서드
    public void activateAccount() {
        this.status = UserStatus.ACTIVE;
        this.emailVerificationToken = null;
        this.tokenExpirationDate = null;
    }

    // ==== 업데이트 로직 ====
    public User update(String name) {
        this.name = name;
        return this;
    }

    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
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