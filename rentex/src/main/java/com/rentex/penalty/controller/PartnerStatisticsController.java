package com.rentex.penalty.controller;

import com.rentex.penalty.dto.PartnerStatisticsDto;
import com.rentex.penalty.service.PartnerStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/partner/statistics")
public class PartnerStatisticsController {

    private final PartnerStatisticsService partnerStatisticsService;

    @GetMapping
    public ResponseEntity<List<PartnerStatisticsDto>> getPartnerStatistics() {
        return ResponseEntity.ok(partnerStatisticsService.getStatistics());
    }
}

