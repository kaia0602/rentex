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


    @GetMapping
    public List<AdminPenaltyUserDTO> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.listOnlyUsers(q, page, size);
    }

    @GetMapping("/{userId}")
    public AdminPenaltyUserDTO getUser(@PathVariable Long userId) {
        return service.userSummary(userId);
    }

    /** 상세 - /api/admin/penalties/{userId}/entries */
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
        service.deleteEntry(userId);
    }

    /** 개별 벌점 삭제 */
    @DeleteMapping("/entries/{entryId}")
    public void deleteEntry(@PathVariable Long entryId) {
        service.deleteEntry(entryId);
    }
}
