package com.rentex.rental.exception;

/**
 * 특정 ID에 해당하는 Rental 데이터를 찾지 못했을 때 발생하는 예외
 * 예: 잘못된 rentalId로 상태 변경 요청 시
 */
public class RentalNotFoundException extends RuntimeException {
    public RentalNotFoundException(String message) {
        super(message);
    }
}
