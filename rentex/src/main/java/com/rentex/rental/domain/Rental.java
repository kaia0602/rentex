package com.rentex.rental.domain;

import com.rentex.global.domain.BaseTimeEntity;
import com.rentex.item.domain.Item;
import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // 현재 대여 상태 (REQUESTED → APPROVED → SHIPPED → RECEIVED → RETURN_REQUESTED → RETURNED)
    @Enumerated(EnumType.STRING)
    private RentalStatus status;

    // 대여 수량
    private int quantity;

    // 대여 시작 예정일
    private LocalDate startDate;

    // 대여 종료 예정일
    private LocalDate endDate;

    // 실제 대여가 시작된 시점 (사용자가 수령 확인한 시점)
    private LocalDateTime rentedAt;

    // 실제 반납이 완료된 시점 (파트너가 반납 승인한 시점)
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

    @OneToMany(mappedBy = "rental", cascade = CascadeType.ALL, orphanRemoval = true)
    @OnDelete(action = OnDeleteAction.CASCADE)   // 렌탈 삭제 시 히스토리도 함께 삭제
    private List<RentalHistory> histories = new ArrayList<>();

    // 연체 여부
    @Builder.Default
    @Column(nullable = false)
    private boolean isOverdue = false;

    // 연체 처리 메서드
    public void markAsOverdue() {
        this.isOverdue = true;
    }

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

    // 사용자 수령 처리 메서드 (SHIPPED → RECEIVED)
    public void receive() {
        if (this.status != RentalStatus.SHIPPED) {
            throw new IllegalStateException("배송 중 상태여야 수령할 수 있습니다.");
        }
        this.status = RentalStatus.RECEIVED;
        this.rentedAt = LocalDateTime.now(); // ✅ 수령 시점을 대여 시작점으로 기록
    }
}
