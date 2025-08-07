package com.rentex.rental.domain;

import com.rentex.global.domain.BaseTimeEntity;
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

    // 이력이 속한 대여 정보 (다대일 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    private Rental rental;

    // 상태 전이 이전 상태
    @Enumerated(EnumType.STRING)
    private RentalStatus fromStatus;

    // 상태 전이 이후 상태
    @Enumerated(EnumType.STRING)
    private RentalStatus toStatus;

    // 해당 상태 전이를 수행한 주체 (USER, ADMIN, PARTNER 등)
    @Enumerated(EnumType.STRING)
    private ActionActor actor;

    // 전이 관련 설명 (예: '관리자 승인', '업체 수령 요청' 등)
    private String description;

    // 상태 전이 시각
    private LocalDateTime changedAt;

    // 엔티티 저장 전 현재 시각을 자동으로 기록
    @PrePersist
    public void prePersist() {
        this.changedAt = LocalDateTime.now();
    }

    // 정적 팩토리 메서드: RentalHistory 객체 생성용
    public static RentalHistory of(Rental rental, RentalStatus from, RentalStatus to, ActionActor actor, String desc) {
        return RentalHistory.builder()
                .rental(rental)
                .fromStatus(from)
                .toStatus(to)
                .actor(actor)
                .description(desc)
                .build();
    }
}
