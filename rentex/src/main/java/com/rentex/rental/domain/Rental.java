package com.rentex.rental.domain;

import com.rentex.global.domain.BaseTimeEntity;
import com.rentex.item.domain.Item;
import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Rental extends BaseTimeEntity {

    // 대여 ID (기본 키)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 대여 요청자 (회원)
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    // 대여할 장비
    @ManyToOne(fetch = FetchType.LAZY)
    private Item item;

    // 현재 대여 상태 (REQUESTED, APPROVED, RENTED, RETURN_REQUESTED, RETURNED)
    @Enumerated(EnumType.STRING)
    private RentalStatus status;

    // 대여 수량
    private int quantity;

    // 대여 시작 예정일
    private LocalDate startDate;

    // 대여 종료 예정일
    private LocalDate endDate;

    // 실제 대여가 시작된 시점 (관리자가 수령 승인한 시점)
    private LocalDateTime rentedAt;

    // 실제 반납이 완료된 시점 (관리자가 반납 승인한 시점)
    @Setter
    private LocalDateTime returnedAt;

    // 파트너가 수령을 확인했는지 여부
    private boolean receivedByPartner;

    // 파트너가 수령 확인한 시각
    private LocalDateTime partnerReceivedAt;

    // 파트너가 반납 검수를 완료했는지 여부
    private boolean returnCheckedByPartner;

    // 파트너가 반납 검수한 시각
    private LocalDateTime partnerReturnCheckedAt;

    // 엔티티 저장 전, 상태가 없으면 기본값으로 REQUESTED 설정
    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = RentalStatus.REQUESTED;
        }
    }

    // 상태 변경 메서드 (일반적인 전이)
    public void changeStatus(RentalStatus newStatus) {
        this.status = newStatus;
    }

    // 대여 시작 처리 메서드 (APPROVED → RENTED)
    public void start() {
        if (this.status != RentalStatus.APPROVED) {
            throw new IllegalStateException("승인된 상태여야 수령할 수 있습니다.");
        }

        this.status = RentalStatus.RENTED;
        this.rentedAt = LocalDateTime.now();
    }

    public void markAsOverdue() {
    }
}
