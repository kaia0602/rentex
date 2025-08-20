package com.rentex.payment.domain;

import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 결제한 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 결제 금액 (예: 벌점당 1000원)
    @Column(nullable = false)
    private int amount;

    // 결제 방식 (예: 카드, 계좌이체, 가상계좌 등)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod method;

    // 결제 상태 (완료 / 실패 등)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    // 결제 일시
    @Column(nullable = false)
    private LocalDateTime paidAt;

    public enum PaymentMethod {
        CARD, ACCOUNT_TRANSFER, VIRTUAL_ACCOUNT, MANUAL
    }

    public enum PaymentStatus {
        SUCCESS, FAILED, PENDING
    }

    public void updateStatus(PaymentStatus status) {
        this.status = status;
    }
}
