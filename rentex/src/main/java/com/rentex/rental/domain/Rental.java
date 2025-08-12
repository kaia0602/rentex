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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    private Item item;

    @Enumerated(EnumType.STRING)
    private RentalStatus status;

    private int quantity;

    private LocalDate startDate;
    private LocalDate endDate;

    private LocalDateTime rentedAt;
    private LocalDateTime returnedAt;

    private boolean receivedByPartner;
    private LocalDateTime partnerReceivedAt;

    private boolean returnCheckedByPartner;
    private LocalDateTime partnerReturnCheckedAt;

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = RentalStatus.REQUESTED;
        }
    }

    // ✅ 반납 요청 시 상태를 변경하는 메서드
    public void requestReturn() {
        if (this.status != RentalStatus.RENTED) {
            throw new IllegalStateException("현재 '대여 중'인 상태가 아니면 반납 요청을 할 수 없습니다.");
        }
        this.status = RentalStatus.RETURN_REQUESTED;
    }
}
