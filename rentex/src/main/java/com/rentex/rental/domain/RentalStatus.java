package com.rentex.rental.domain;

public enum RentalStatus {
    REQUESTED("대여 요청", "gray"),          // 사용자
    APPROVED("대여 승인", "blue"),          // 파트너
    SHIPPED("배송 중", "cyan"),             // 파트너
    RECEIVED("장비 수령", "green"),         // 사용자
    RETURN_REQUESTED("반납 요청", "orange"), // 사용자
    RETURNED("반납 완료", "black"),         // 파트너
    CANCELED("취소됨", "lightgray"),
    REJECTED("거절됨", "red");

    private final String label;       // 사용자에게 보여줄 라벨
    private final String badgeColor;  // 프론트에서 상태 뱃지용 색상

    RentalStatus(String label, String badgeColor) {
        this.label = label;
        this.badgeColor = badgeColor;
    }

    public String getLabel() {
        return label;
    }

    public String getBadgeColor() {
        return badgeColor;
    }
}
