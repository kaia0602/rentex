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

    private int point;
    private boolean paid;

    public void addPoint(int score) {
        this.point += score;
        this.paid = false;
    }

    public void resetPoint() {
        this.point = 0;
        this.paid = true;
    }

    public void reset() {
        this.point = 0;
        this.paid = true;
    }

}