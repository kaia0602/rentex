package com.rentex.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // 🔐 인증/인가 관련
    UNAUTHORIZED_USER(HttpStatus.UNAUTHORIZED, "인증되지 않은 사용자입니다."),
    FORBIDDEN_USER(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),

    // 🧑 사용자 관련
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    DUPLICATE_EMAIL(HttpStatus.BAD_REQUEST, "이미 존재하는 이메일입니다."),

    // 📦 대여/장비 관련
    ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "장비를 찾을 수 없습니다."),
    ITEM_OUT_OF_STOCK(HttpStatus.BAD_REQUEST, "장비 재고가 부족합니다."),
    INVALID_RENTAL_STATUS(HttpStatus.BAD_REQUEST, "잘못된 대여 상태입니다."),
    PENALTY_BLOCKED(HttpStatus.FORBIDDEN, "벌점 3점 이상으로 대여가 제한되었습니다. 패널티 결제를 먼저 진행하세요."),

    // 💥 기타
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류입니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
