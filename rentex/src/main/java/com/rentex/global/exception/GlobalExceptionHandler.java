package com.rentex.global.exception;

import com.rentex.rental.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiErrorResponse> handleCustomException(CustomException ex, HttpServletRequest req) {
        HttpStatus status = ex.getErrorCode().getStatus();
        String code = ex.getErrorCode().name(); // 혹은 ex.getErrorCode().getCode()
        return ResponseEntity.status(status)
                .body(new ApiErrorResponse(
                        code,
                        ex.getMessage(),
                        status.value(),
                        LocalDateTime.now(),
                        req.getRequestURI()
                ));
    }

    /** 공통 응답 포맷 */
    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message
        ));
    }

    @ExceptionHandler(ItemNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleItemNotFound(
            ItemNotFoundException e, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", e.getMessage(), req);
    }

    @ExceptionHandler(RentalNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleRentalNotFound(
            RentalNotFoundException e, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "RENTAL_NOT_FOUND", e.getMessage(), req);
    }

    @ExceptionHandler(ItemUnavailableException.class)
    public ResponseEntity<ApiErrorResponse> handleItemUnavailable(
            ItemUnavailableException e, HttpServletRequest req) {
        // 재고 부족/사용불가 등 요청이 잘못된 경우 → 400
        return build(HttpStatus.BAD_REQUEST, "ITEM_UNAVAILABLE", e.getMessage(), req);
    }

    @ExceptionHandler(InvalidRentalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidState(
            InvalidRentalStateException e, HttpServletRequest req) {
        // 상태 전이가 논리적으로 충돌 → 409
        return build(HttpStatus.CONFLICT, "INVALID_RENTAL_STATE", e.getMessage(), req);
    }

    @ExceptionHandler(PenaltyBlockedException.class)
    public ResponseEntity<ApiErrorResponse> handlePenaltyBlocked(
            PenaltyBlockedException e, HttpServletRequest req) {
        // 정책에 의해 금지 → 403
        return build(HttpStatus.FORBIDDEN, "PENALTY_BLOCKED", e.getMessage(), req);
    }

    // 그 밖의 예상치 못한 예외는 500으로 수습
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleAny(
            Exception e, HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "서버 오류가 발생했습니다.", req);
    }

    private ResponseEntity<ApiErrorResponse> build(
            HttpStatus status, String code, String message, HttpServletRequest req) {
        return ResponseEntity.status(status)
                .body(new ApiErrorResponse(code, message, status.value(), LocalDateTime.now(), req.getRequestURI()));
    }

    @Getter
    @AllArgsConstructor
    public static class ApiErrorResponse {
        private final String code;        // 프론트 분기용: ITEM_UNAVAILABLE, PENALTY_BLOCKED ...
        private final String message;     // 사용자 노출 메시지
        private final int status;         // HTTP status code (e.g., 400, 403, 404, 409)
        private final LocalDateTime timestamp;
        private final String path;        // 요청 경로
    }
}
