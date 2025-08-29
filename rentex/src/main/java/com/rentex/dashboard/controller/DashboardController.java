package com.rentex.dashboard.controller;

import com.rentex.dashboard.dto.ActivityDTO;
import com.rentex.dashboard.dto.DashboardSummaryDTO;
import com.rentex.dashboard.dto.TrendPointDTO;
import com.rentex.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /** 요약 카드 */
    @GetMapping("/summary")
    public DashboardSummaryDTO getSummary(Authentication auth) {
        return dashboardService.getSummary(auth);
    }

    /** 최근 7일 추이 */
    @GetMapping("/trends")
    public List<TrendPointDTO> getTrends(Authentication auth) {
        return dashboardService.getTrends(auth);
    }

    /** 최근 활동 */
    @GetMapping("/activities")
    public List<ActivityDTO> getActivities(
            Authentication auth,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return dashboardService.getActivities(auth, limit);
    }
}
