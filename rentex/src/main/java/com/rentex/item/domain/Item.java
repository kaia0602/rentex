package com.rentex.item.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rentex.category.domain.Category;
import com.rentex.category.domain.SubCategory;
import com.rentex.global.domain.BaseTimeEntity;
import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Setter
public class Item extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 장비 ID

    @Column(nullable = false, length = 100)
    private String name; // 장비명

    private String description; // 간단 설명

    @Column(nullable = false)
    private int stockQuantity; // 재고 수량

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemStatus status; // 장비 상태

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private User partner; // 소유 파트너 (role = PARTNER)

    @Column(length = 500)
    private String thumbnailUrl; // 대표 썸네일

    @Lob
    private String detailDescription; // 상세 설명

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "item_detail_images", joinColumns = @JoinColumn(name = "item_id"))
    @Column(name = "image_url", length = 1000)
    private List<String> detailImages = new ArrayList<>(); // 상세 이미지들

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnore
    private Category category; // 카테고리

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_category_id")
    private SubCategory subCategory; // 서브 카테고리

    @Column(nullable = false)
    private int dailyPrice; // 하루 단가

    public enum ItemStatus { AVAILABLE, UNAVAILABLE } // 상태 ENUM

    public void decreaseStock(int quantity) { // 재고 차감
        if (this.stockQuantity < quantity) throw new IllegalStateException("재고 부족");
        this.stockQuantity -= quantity;
    }

    public void increaseStock(int quantity) { // 재고 복구
        this.stockQuantity += quantity;
    }
}
