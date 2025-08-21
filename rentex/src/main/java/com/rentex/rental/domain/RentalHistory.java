package com.rentex.rental.domain;

import com.rentex.global.domain.BaseTimeEntity;
import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RentalHistory extends BaseTimeEntity {

    // 고유 ID (기본 키)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_id", nullable = false)
    private Rental rental;

    // 상태 전이 이전 상태
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private RentalStatus fromStatus;

    // 상태 전이 이후 상태
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private RentalStatus toStatus;

    // 수행한 주체 (USER, ADMIN, PARTNER 등)
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ActionActor actor;

    // 전이 관련 설명 (예: '관리자 승인', '업체 수령 요청' 등)
    private String description;

    // 상태 전이 시각
    private LocalDateTime changedAt;

    // 상태 변경을 실제 수행한 유저 (닉네임/파트너명 표시용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    private User actorUser;

    // 엔티티 저장 전 현재 시각을 자동으로 기록
    @PrePersist
    public void prePersist() {
        this.changedAt = LocalDateTime.now();
    }

    // 정적 팩토리 메서드: RentalHistory 객체 생성용
    public static RentalHistory of(
            Rental rental,
            RentalStatus from,
            RentalStatus to,
            ActionActor actor,
            String desc,       // String 먼저
            User actorUser     // User 나중에
    ) {
        return RentalHistory.builder()
                .rental(rental)
                .fromStatus(from)
                .toStatus(to)
                .actor(actor)
                .description(desc)
                .actorUser(actorUser)   // 닉네임/파트너명 연결
                .build();
    }
}
