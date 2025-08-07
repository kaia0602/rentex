package com.rentex.item.domain;

import com.rentex.global.domain.BaseTimeEntity;
import com.rentex.partner.domain.Partner;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Item extends BaseTimeEntity {

    // 장비 ID (기본 키)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 장비명
    @Column(nullable = false, length = 100)
    private String name;

    // 장비 설명
    private String description;

    // 현재 재고 수량
    @Column(nullable = false)
    private int stockQuantity;

    // 장비 상태 (사용 가능 여부)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemStatus status;

    // 장비를 소유한 파트너(업체)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private Partner partner;

    @Column(length = 500)
    private String thumbnailUrl;

    // 장비 상태 ENUM
    public enum ItemStatus {
        AVAILABLE,      // 사용 가능
        UNAVAILABLE     // 사용 불가
    }

    // 재고 차감 메서드
    public void decreaseStock(int quantity) {
        if (this.stockQuantity < quantity) {
            throw new IllegalStateException("재고 부족");
        }
        this.stockQuantity -= quantity;
    }

    // 재고 복구 메서드
    public void increaseStock(int quantity) {
        this.stockQuantity += quantity;
    }

    @Column(nullable = false)
    private int dailyPrice; // 하루 단가

}
