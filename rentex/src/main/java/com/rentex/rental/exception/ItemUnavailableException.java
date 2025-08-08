package com.rentex.rental.exception;

/**
 * 요청한 대여 기간 동안 장비가 이미 예약되어 있어서 대여가 불가능할 때 발생하는 예외
 * 예: 중복 대여 방지 로직에서 사용
 */
public class ItemUnavailableException extends RuntimeException {
    public ItemUnavailableException(String message) {
        super(message);
    }
}
