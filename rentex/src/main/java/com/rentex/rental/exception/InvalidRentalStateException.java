package com.rentex.rental.exception;

/**
 * 잘못된 대여 상태에서 동작을 시도할 때 발생하는 예외
 * 예: 반납 요청 상태가 아닌데 반납 처리 시도, 승인 상태가 아닌데 대여 시작 등
 */
public class InvalidRentalStateException extends RuntimeException {
    public InvalidRentalStateException(String message) {
        super(message);
    }
}
