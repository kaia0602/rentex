package com.rentex.rental.exception;

/**
 * 요청한 ID에 해당하는 장비(Item)를 찾지 못했을 때 발생하는 예외
 */
public class ItemNotFoundException extends RuntimeException {
    public ItemNotFoundException(String message) {
        super(message);
    }
}
