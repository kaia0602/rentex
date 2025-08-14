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

    @ManyToOne(fetch = FetchType.LAZY) // ✅ OneToOne -> ManyToOne으로 변경
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

<<<<<<< HEAD
    @Column(nullable = false)
    private int points; // ✅ 이번에 부과된 벌점

    private String reason; // ✅ 벌점 부과 사유

    @Column(nullable = false)
    @Builder.Default
    private boolean isPaid = false; // 벌점 납부 여부
=======
    private int point;
    private boolean paid;

    public void addPoint(int score) {
        this.point += score;
    }

    public void resetPoint() {
        this.point = 0;
        this.paid = true;
    }

    public void reset() {
        this.point = 0;
        this.paid = true;
    }

>>>>>>> origin/feature/admin-items
}