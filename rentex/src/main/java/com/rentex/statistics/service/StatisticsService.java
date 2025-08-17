// src/main/java/com/rentex/statistics/service/StatisticsService.java
package com.rentex.statistics.service;

import com.rentex.statistics.dto.*;
import com.rentex.statistics.repository.StatisticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final StatisticsRepository repo;

    public List<AdminPartnerSummaryDTO> adminSummary(LocalDate from, LocalDate to) {
        return repo.adminPartnerSummary(from, to);
    }

    public List<AdminPartnerItemDetailDTO> adminPartnerItems(Long partnerId, LocalDate from, LocalDate to) {
        return repo.adminPartnerItemDetails(partnerId, from, to);
    }

    public PartnerMonthlyStatementDTO partnerMonthlyByUserId(Long userId, int year, int month) {
        Long partnerId = repo.resolvePartnerIdByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 userId에 연결된 파트너가 없습니다: " + userId));
        return repo.partnerMonthlyByPartnerId(partnerId, YearMonth.of(year, month));
    }
}
