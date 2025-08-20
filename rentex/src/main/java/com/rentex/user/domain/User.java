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
@Table(name = "users") // 예약어 충돌 방지 위해 "users" 사용
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

    @Column(nullable = false, unique = true, length = 20)
    private String nickname;

    // USER / PARTNER / ADMIN
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = "USER";

    @Builder.Default
    private int penaltyPoints = 0;

    private LocalDateTime withdrawnAt;

    // ==== 이메일 인증 필드 (HEAD 브랜치 기능 통합) ====
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING; // 기본 상태는 '인증 대기'

    private String emailVerificationToken;

    private LocalDateTime tokenExpirationDate;

    // === Partner 전용 필드 (단일 테이블 전략) ===
    @Column(length = 20, unique = true)
    private String businessNo;

    @Column(length = 100)
    private String contactEmail;

    @Column(length = 20)
    private String contactPhone;

    // ==== 생성자 ====
    public User(String email, String password, String name, String nickname) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
        this.role = "USER"; // 기본 역할
        this.status = UserStatus.PENDING; // 기본 상태
    }

    // ==== 도메인 로직 ====

    /**
     * 계정을 활성화 상태로 변경합니다. (이메일 인증 완료 시 호출)
     */
    public void activateAccount() {
        this.status = UserStatus.ACTIVE;
        this.emailVerificationToken = null;
        this.tokenExpirationDate = null;
    }

    /**
     * 닉네임을 업데이트합니다.
     */
    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    /**
     * 비밀번호를 업데이트합니다.
     */
    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    /**
     * 벌점을 추가합니다.
     */
    public void addPenalty(int points) {
        this.penaltyPoints += points;
    }

    /**
     * 회원 탈퇴 처리 (Soft Delete)
     */
    public void withdraw() {
        this.withdrawnAt = LocalDateTime.now();
        this.status = UserStatus.DISABLED; // 비활성화 상태로 변경
    }

    public enum UserStatus {
        PENDING, // 인증 대기
        ACTIVE,  // 활성 (인증 완료)
        DISABLED // 비활성화 (탈퇴 등)
    }
}