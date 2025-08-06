package com.rentex.user.domain;

import com.rentex.global.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED) // 1. 상속 전략 설정 (조인 전략)
@DiscriminatorColumn(name = "role") // 2. 사용자의 역할을 구분할 컬럼
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

    // 이 필드는 DTYPE 컬럼에 자동으로 매핑될 것이므로,
    // @Enumerated 어노테이션은 사용하지 않습니다.
    // 대신, INSERT/UPDATE가 불가능하도록 설정하여 JPA가 관리하도록 합니다.
    @Column(name = "role", insertable = false, updatable = false)
    private String role;

    // 생성자나 빌더에서 password를 설정할 수 있도록 protected로 변경
    protected User(String email, String password, String name, String nickname) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
    }
}