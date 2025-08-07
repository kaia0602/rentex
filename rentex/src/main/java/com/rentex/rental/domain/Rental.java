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

    @Column(nullable = false)
    private boolean isOverdue = false;

    public void markAsOverdue() {
        this.isOverdue = true;
    }

}
