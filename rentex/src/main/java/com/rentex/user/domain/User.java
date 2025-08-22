package com.rentex.user.domain;

import com.rentex.global.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users") // ✅ 예약어 충돌 방지 위해 "users" 권장
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

    // 프로필 이미지 (구글/네이버/카카오 등 소셜 로그인용)
    @Column(length = 300)
    private String profileImageUrl;

    // USER / PARTNER / ADMIN
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = "USER";

    @Builder.Default
    private int penaltyPoints = 0;

    private LocalDateTime withdrawnAt; // 탈퇴 일시 (soft delete)

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
        this.role = role;
    }

    // ==== 업데이트 로직 ====
    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    public void updateProfileImage(String profileImageUrl) { // 추가
        this.profileImageUrl = profileImageUrl;
    }
    // 파트너 전용 필드 업데이트
    public void updateBusinessNo(String businessNo) {
        this.businessNo = businessNo;
    }

    public void updateContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public void updateContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public void updateName(String name) { // 업체명 (일반 유저도 가능)
        this.name = name;
    }

    // ==== 벌점 처리 ====
    public void addPenalty(int points) {
        this.penaltyPoints += points;
    }

    public void decreasePenalty(int points) {
        this.penaltyPoints = Math.max(0, this.penaltyPoints - points);
    }

    public void resetPenaltyPoints() {
        this.penaltyPoints = 0;
    }

    // ==== 탈퇴 처리 ====
    public void withdraw() {
        this.withdrawnAt = LocalDateTime.now();
    }
}