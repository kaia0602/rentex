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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Rental rental;

    @Enumerated(EnumType.STRING)
    private RentalStatus fromStatus;

    @Enumerated(EnumType.STRING)
    private RentalStatus toStatus;

    @Enumerated(EnumType.STRING)
    private ActionActor actor;

    private String description;

    private LocalDateTime changedAt;

    @PrePersist
    public void prePersist() {
        this.changedAt = LocalDateTime.now();
    }

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
