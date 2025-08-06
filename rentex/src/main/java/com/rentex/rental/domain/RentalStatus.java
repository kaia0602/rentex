package com.rentex.rental.domain;

public enum RentalStatus {
    REQUESTED,         // 사용자 대여 요청
    APPROVED,          // 관리자가 승인
    RENTED,            // 실제 대여 중
    RETURN_REQUESTED,  // 반납 요청
    RETURNED,          // 반납 완료
    CANCELED,          // 사용자 또는 관리자에 의한 취소
    REJECTED;          // 승인 거절
}