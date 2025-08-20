package com.rentex.penalty.repository;

import java.sql.Timestamp;

public interface AdminPenaltyUserProjection {
    Long getUserId();
    String getName();
    String getEmail();
    Integer getPenaltyPoints();

    int getActiveEntries();       // VALID 상태 건수
    Timestamp getLastGivenAt();    // 최근 VALID 부여 시각 (Timestamp -> toLocalDateTime() 호출용)
}


