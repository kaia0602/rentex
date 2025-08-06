package com.rentex.penalty.domain;

import com.rentex.global.domain.BaseTimeEntity;
import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Penalty extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private int point; // 누적 벌점

    private boolean paid; // 패널티 결제 여부

    public void addPoint(int score) {
        this.point += score;
    }

    public void resetPoint() {
        this.point = 0;
        this.paid = true;
    }
}
