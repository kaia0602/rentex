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
        // 월별 수익 조회
        var ym = YearMonth.of(year, month);
        var from = ym.atDay(1);
        var to   = ym.atEndOfMonth();

        // Repository 호출
        List<PartnerMonthlyItemDetailDTO> details = repo.partnerMonthlyItemDetails(partnerId, from, to);

        long totalRentals = repo.countPartnerRentals(partnerId, from, to);
        long totalQuantity = details.stream().mapToLong(PartnerMonthlyItemDetailDTO::getQuantity).sum();
        long totalDays     = details.stream().mapToLong(PartnerMonthlyItemDetailDTO::getDays).sum();
        long totalRevenue  = details.stream().mapToLong(PartnerMonthlyItemDetailDTO::getAmount).sum();

        // 전체 수익
        long totalRevenueAllTime = repo.partnerTotalRevenueAllTime(partnerId);

        return PartnerMonthlyStatementDTO.builder()
                .year(ym.getYear())
                .month(ym.getMonthValue())
                .totalRentals(totalRentals)
                .totalQuantity(totalQuantity)
                .totalDays(totalDays)
                .totalRevenue(totalRevenue)
                .totalRevenueAllTime(totalRevenueAllTime)
                .details(details)
                .build();


    }

}
