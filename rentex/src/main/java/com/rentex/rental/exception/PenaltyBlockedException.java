package com.rentex.rental.exception;

import com.rentex.global.exception.CustomException;
import com.rentex.global.exception.ErrorCode;

public class PenaltyBlockedException extends CustomException {
    public PenaltyBlockedException() {
        super(ErrorCode.PENALTY_BLOCKED);
    }
}
