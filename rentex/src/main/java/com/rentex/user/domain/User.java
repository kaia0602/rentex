package com.rentex.user.domain;

import com.rentex.global.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "role")
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

    @Column(nullable = false)
    private int penaltyPoints = 0; // ✅ 벌점 필드 (기본값 0)

    private LocalDateTime withdrawnAt; // ✅ 회원 탈퇴 일시 (soft delete용)

    public User(String email, String password, String name, String nickname) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
    }

    public User update(String name) {
        this.name = name;
        return this;
    }

    // ✅ 비밀번호를 변경하는 메서드 추가
    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    // ✅ 벌점을 추가하는 편의 메서드
    public void addPenalty(int points) {
        this.penaltyPoints += points;
    }

    // ✅ 회원 탈퇴 처리 메서드
    public void withdraw() {
        this.withdrawnAt = LocalDateTime.now();
        // 필요하다면 개인정보를 마스킹 처리할 수도 있습니다.
        // this.name = "탈퇴한사용자";
        // this.email = "withdrawn@" + this.id;
    }

    // ✅ 닉네임 변경 메서드
    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }
}