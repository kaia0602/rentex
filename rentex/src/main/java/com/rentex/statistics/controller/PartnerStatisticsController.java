// src/main/java/com/rentex/statistics/controller/PartnerStatisticsController.java
package com.rentex.statistics.controller;

import com.rentex.statistics.dto.PartnerMonthlyStatementDTO;
import com.rentex.statistics.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/partner/statistics")
@RequiredArgsConstructor
public class PartnerStatisticsController {

    private final StatisticsService service;

    @GetMapping("/{userId}")
    public PartnerMonthlyStatementDTO monthlyByUserId(
            @PathVariable("userId") Long userId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return service.partnerMonthlyByUserId(userId, year, month);
    }
}
