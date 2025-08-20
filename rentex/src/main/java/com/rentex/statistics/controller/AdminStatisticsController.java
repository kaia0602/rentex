// src/main/java/com/rentex/statistics/controller/AdminStatisticsController.java
package com.rentex.statistics.controller;

import com.rentex.statistics.dto.AdminPartnerItemDetailDTO;
import com.rentex.statistics.dto.AdminPartnerSummaryDTO;
import com.rentex.statistics.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;


@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
public class AdminStatisticsController {

    private final StatisticsService service;

    @GetMapping
    public List<AdminPartnerSummaryDTO> summary(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        LocalDate from;
        LocalDate to;

        if (year != null && month != null) {
            var ym = YearMonth.of(year, month);
            from = ym.atDay(1);
            to = ym.atEndOfMonth();
        } else if (start != null && end != null) {
            from = start;
            to = end;
        } else {
            var ym = YearMonth.now();
            from = ym.atDay(1);
            to = ym.atEndOfMonth();
        }

        return service.adminSummary(from, to);
    }

    @GetMapping("/partners/{partnerId}/items")
    public List<AdminPartnerItemDetailDTO> partnerItems(
            @PathVariable Long partnerId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        LocalDate from;
        LocalDate to;

        if (year != null && month != null) {
            var ym = YearMonth.of(year, month);
            from = ym.atDay(1);
            to = ym.atEndOfMonth();
        } else if (start != null && end != null) {
            from = start;
            to = end;
        } else {
            var ym = YearMonth.now();
            from = ym.atDay(1);
            to = ym.atEndOfMonth();
        }

        return service.adminPartnerItems(partnerId, from, to);
    }
}
