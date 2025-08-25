package com.rentex.qna.controller;

import com.rentex.qna.domain.Inquiry;
import com.rentex.qna.dto.InquiryResponse;
import com.rentex.qna.dto.InquirySaveRequest;
import com.rentex.qna.service.InquiryService;
import com.rentex.user.domain.User;
import com.rentex.user.service.UserService;
import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/qna")
public class InquiryController {

    private final InquiryService inquiryService;
    private final UserService userService;

    /** 전체 목록: 공개글은 누구나, 비밀글은 목록에 노출 (내용은 null 처리) */
    @GetMapping
    @PermitAll
    public Page<InquiryResponse> list(Pageable pageable, Principal principal) {
        User actorNullable = getUserOrNull(principal);
        return inquiryService.getAll(pageable).map(q -> {
            InquiryResponse dto = toDto(q, actorNullable);

            // secret 글인데 작성자/관리자가 아닌 경우 내용/답변 숨김
            if (q.isSecret() && !(actorNullable != null &&
                    ("ADMIN".equalsIgnoreCase(actorNullable.getRole()) ||
                            q.getAuthor().getId().equals(actorNullable.getId())))) {

                return new InquiryResponse(
                        dto.id(),
                        dto.title(),
                        null, // 내용 숨김
                        dto.secret(),
                        dto.status(),
                        dto.authorId(),
                        dto.authorNickname(),
                        dto.editable(),
                        dto.deletable(),
                        dto.createdAt(),
                        dto.updatedAt(),
                        null // 답변 숨김
                );
            }

            return dto;
        });
    }


    /** 문의 생성: USER/PARTNER/ADMIN */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER','PARTNER','ADMIN')")
    public InquiryResponse create(@RequestBody InquirySaveRequest req, Principal principal) {
        User actor = getUserOrThrow(principal);
        Inquiry saved = inquiryService.create(actor, req);
        return toDto(saved, actor);
    }

    /** 내 문의 목록: 로그인 필요 */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public Page<InquiryResponse> myList(Pageable pageable, Principal principal) {
        User actor = getUserOrThrow(principal);
        return inquiryService.getMyList(actor.getId(), pageable).map(q -> toDto(q, actor));
    }

    /**
     * 단건 조회: 공개는 누구나, 비밀글은 비번 또는 관리자/작성자만
     * 비밀번호는 헤더: X-Inquiry-Password
     */
    @GetMapping("/{id}")
    @PermitAll
    public InquiryResponse getOne(
            @PathVariable Long id,
            @RequestHeader(value = "X-Inquiry-Password", required = false) String password,
            Principal principal // 비로그인 허용 → null일 수 있음
    ) {
        User actorNullable = getUserOrNull(principal);
        Inquiry q = inquiryService.getForView(id, actorNullable, password);
        return toDto(q, actorNullable);
    }

    /** 수정: 작성자/관리자 (서비스에서 최종 검증) */
    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public InquiryResponse update(
            @PathVariable Long id,
            @RequestBody InquirySaveRequest req,
            Principal principal
    ) {
        User actor = getUserOrThrow(principal);
        Inquiry updated = inquiryService.update(id, actor, req);
        return toDto(updated, actor);
    }

    /** 삭제: 작성자/관리자 (서비스에서 최종 검증) */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public void delete(@PathVariable Long id, Principal principal) {
        User actor = getUserOrThrow(principal);
        inquiryService.delete(id, actor);
    }

    // === helpers ===
    private User getUserOrThrow(Principal principal) {
        if (principal == null) throw new IllegalStateException("로그인이 필요합니다.");
        Long userId = Long.parseLong(principal.getName()); // subject = userId (Long)
        return userService.getUserById(userId);
    }

    private User getUserOrNull(Principal principal) {
        if (principal == null) return null;
        Long userId = Long.parseLong(principal.getName());
        return userService.getUserById(userId);
    }

    private InquiryResponse toDto(Inquiry q, User actorNullable) {
        boolean canWrite = actorNullable != null
                && actorNullable.getRole() != null
                && ("ADMIN".equalsIgnoreCase(actorNullable.getRole())
                || q.getAuthor().getId().equals(actorNullable.getId()));

        return new InquiryResponse(
                q.getId(),
                q.getTitle(),
                q.getContent(),
                q.isSecret(),
                q.getStatus().name(),
                q.getAuthor().getId(),
                q.getAuthor().getNickname(),
                canWrite,
                canWrite,
                q.getCreatedAt(),
                q.getUpdatedAt(),
                q.getAnswerContent() // ✅ 답변 포함
        );
    }
}
