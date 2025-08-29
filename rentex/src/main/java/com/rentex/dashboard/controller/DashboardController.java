package com.rentex.dashboard.controller;

import com.rentex.admin.dto.AdminDashboardDTO;
import com.rentex.dashboard.dto.*;
import com.rentex.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /** 🔹 내부 관리자/파트너 대시보드용 (진행 중, 연체 등 상세) */
    @GetMapping("/internal/summary")
    public ResponseEntity<DashboardSummaryDTO> getInternalSummary() {
        return ResponseEntity.ok(dashboardService.getSummary(null));
    }

    /** 🔹 메인 공개 요약 (users, partners, transactions, revenue) */
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getPublicSummary() {
        return ResponseEntity.ok(dashboardService.getSummary(null));
    }

    /** 🔹 최근 7일 추이 */
    @GetMapping("/trends")
    public ResponseEntity<List<TrendPointDTO>> getTrends() {
        return ResponseEntity.ok(dashboardService.getTrends(null));
    }

    /** 🔹 최근 활동 */
    @GetMapping("/activities")
    public ResponseEntity<List<ActivityDTO>> getActivities(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(dashboardService.getActivities(null, limit));
    }

    /** 🔹 하이라이트 (인기/최근 등록 장비) */
    @GetMapping("/highlights")
    public ResponseEntity<HighlightsResponse> getHighlights(
            @RequestParam(defaultValue = "7") int days
    ) {
        if (days <= 0) days = 7;
        return ResponseEntity.ok(dashboardService.getHighlights(days));
    }

    @GetMapping("/partner-count")
    public ResponseEntity<PartnerCountDTO> getPartnerCount() {
        return ResponseEntity.ok(dashboardService.getPartnerCount());
    }

}
