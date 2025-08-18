// src/main/java/com/rentex/statistics/controller/PartnerStatisticsController.java
package com.rentex.statistics.controller;

import com.rentex.statistics.dto.PartnerMonthlyStatementDTO;
import com.rentex.statistics.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/partners/statistics")
@RequiredArgsConstructor
public class PartnerStatisticsController {

    private final StatisticsService service;

    @GetMapping("/monthly")
    public PartnerMonthlyStatementDTO monthlyByUserId(
            @RequestParam Long userId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return service.partnerMonthlyByUserId(userId, year, month);
    }
}
