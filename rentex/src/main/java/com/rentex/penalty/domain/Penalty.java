package com.rentex.penalty.domain;

import com.rentex.global.domain.BaseTimeEntity;
import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Setter(AccessLevel.PROTECTED)
public class Penalty extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String reason;

    @Column(nullable = false)
    private Integer point;

    private boolean paid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private PenaltyStatus status = PenaltyStatus.VALID;

    @CreationTimestamp
    @Column(name = "given_at", updatable = false)
    private LocalDateTime givenAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "cleared_at")
    private LocalDateTime clearedAt;

    public void reset() {
        this.point = 0;
        this.paid = true;
        this.status = PenaltyStatus.CLEARED;
    }

    /** 상태 헬퍼 */
    public void markDeleted() {
        this.status = PenaltyStatus.DELETED;
        this.deletedAt = LocalDateTime.now();
    }
    public void markCleared() {
        this.status = PenaltyStatus.CLEARED;
        this.clearedAt = LocalDateTime.now();
    }
}
