package com.rentex.payment.domain;

import com.rentex.global.domain.BaseTimeEntity;
import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Payment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    private int amount; // 결제 금액

    private String method; // 결제 수단 (카카오페이, 토스 등)

    private boolean success; // 결제 성공 여부

    private String paymentKey; // 외부 결제 고유키 (예: 토스 결제번호)
}
