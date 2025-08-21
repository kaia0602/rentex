package com.rentex.notice.controller;

import com.rentex.notice.dto.NoticeDtos.*;
import com.rentex.notice.service.NoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping("/notices")
    public NoticeListResponse list(@RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "10") int size) {
        return noticeService.list(page, size);
    }

    @GetMapping("/notices/{id}")
    public NoticeDetail detail(@PathVariable Long id) {
        return noticeService.detail(id);
    }

    // --- ADMIN 전용 ---
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/notices")
    public Long create(Authentication auth, @Valid @RequestBody NoticeCreateRequest req) {
        Long userId = Long.parseLong(auth.getName()); // subject = userId
        return noticeService.create(userId, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/notices/{id}")
    public void update(@PathVariable Long id, @Valid @RequestBody NoticeUpdateRequest req) {
        noticeService.update(id, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/notices/{id}")
    public void delete(@PathVariable Long id) {
        noticeService.delete(id);
    }

    // --- 댓글: USER/PARTNER/ADMIN ---
    @PreAuthorize("hasAnyRole('USER','PARTNER','ADMIN')")
    @PostMapping(value = "/notices/{id}/comments", consumes = "text/plain")
    public Long addCommentText(@PathVariable Long id, Authentication auth, @RequestBody String content) {
        Long userId = Long.parseLong(auth.getName());
        return noticeService.addComment(id, userId, content);
    }

    @PreAuthorize("hasAnyRole('USER','PARTNER','ADMIN')")
    @DeleteMapping("/notices/{id}/comments/{commentId}")
    public void deleteComment(@PathVariable Long id,
                              @PathVariable Long commentId,
                              Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        noticeService.deleteComment(id, commentId, userId, isAdmin);
    }

    public record AddCommentRequest(String content) {}
}
