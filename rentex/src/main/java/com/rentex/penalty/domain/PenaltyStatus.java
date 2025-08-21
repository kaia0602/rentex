package com.rentex.penalty.domain;

public enum PenaltyStatus {
    VALID,     // 유효(벌점 반영 중)
    DELETED,   // 개별 삭제(관리자 취소)
    CLEARED;   // 전체 초기화로 무력화

    /** 유효한 상태인지 */
    public boolean isValid() {
        return this == VALID;
    }
}
