package com.rentex.rental.domain;

public enum RentalStatus {
    REQUESTED("요청됨", "gray"),
    APPROVED("승인됨", "blue"),
    RENTED("대여중", "green"),
    RETURN_REQUESTED("반납 요청", "orange"),
    RETURNED("반납 완료", "black"),
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
