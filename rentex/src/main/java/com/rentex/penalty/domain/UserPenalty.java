package com.rentex.penalty.domain;

import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_penalty")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserPenalty {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String reason;

    @Column(nullable = false)
    private Integer points = 1;

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
