package com.rentex.user.domain;

import com.rentex.global.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user")
@Inheritance(strategy = InheritanceType.JOINED) // Partner 상속 고려
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

    // Role은 Enum이 아니라 String 유지
    @Column(name = "role", insertable = false, updatable = false)
    private String role;

    @Builder.Default
    private int penaltyPoints = 0;

    private LocalDateTime withdrawnAt; // 탈퇴 일시 (soft delete)

    // ==== 생성자 ====
    public User(String email, String password, String name, String nickname) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
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
        // 개인정보 마스킹 필요 시 아래 사용
        // this.name = "탈퇴한사용자";
        // this.email = "withdrawn@" + this.id;
    }
}
