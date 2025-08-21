package com.rentex.penalty.controller;

import com.rentex.penalty.dto.*;
import com.rentex.penalty.service.AdminPenaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/penalties")
@RequiredArgsConstructor
public class AdminPenaltyController {

    private final AdminPenaltyService service;

    /** 전체 + 유저만 조회 통합 */
    @GetMapping
    public List<AdminPenaltyUserDTO> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "ALL") String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        if ("USER_ONLY".equalsIgnoreCase(role)) {
            // 프론트에서 role=USER_ONLY 보내면 "유저만" 조회
            return service.listOnlyUsers(q, page, size);
        }
        // 그 외 (ALL, USER, ADMIN, PARTNER)는 전체 계정 조회
        return service.listAllAccounts(q, role, page, size);
    }

    /** 사용자 요약 */
    @GetMapping("/{userId}")
    public AdminPenaltyUserDTO getUser(@PathVariable Long userId) {
        return service.userSummary(userId);
    }

    /** 상세 - 벌점 엔트리 목록 */
    @GetMapping("/{userId}/entries")
    public List<AdminPenaltyEntryDTO> entries(@PathVariable Long userId) {
        return service.entries(userId);
    }

    /** 벌점 부여 */
    @PostMapping("/{userId}/grant")
    public void grant(@PathVariable Long userId, @RequestBody GrantPenaltyRequest req) {
        service.grant(userId, req);
    }

    /** 사용자 벌점 전체 초기화 */
    @PostMapping("/{userId}/reset")
    public void reset(@PathVariable Long userId) {
        service.reset(userId); // ✅ 수정
    }

    /** 개별 벌점 삭제 */
    @DeleteMapping("/entries/{entryId}")
    public void deleteEntry(@PathVariable Long entryId) {
        service.deleteEntry(entryId);
    }
}
