package com.rentex.qna.controller;

import com.rentex.qna.domain.Inquiry;
import com.rentex.qna.domain.InquiryStatus;
import com.rentex.qna.dto.InquiryAnswerRequest;
import com.rentex.qna.dto.InquiryResponse;
import com.rentex.qna.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/inquiries")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInquiryController {

    private final InquiryRepository inquiryRepository;

    /** 문의 전체 목록(관리자) - 상태/작성자 필터 */
    @GetMapping
    @Transactional(readOnly = true)
    public Page<InquiryResponse> list(
            @RequestParam(name = "status", required = false, defaultValue = "ALL") String status,
            @RequestParam(name = "authorId", required = false) Long authorId,
            Pageable pageable
    ) {
        Page<Inquiry> page;
        if (authorId != null && !"ALL".equalsIgnoreCase(status)) {
            page = inquiryRepository.findByAuthorIdAndStatus(
                    authorId,
                    InquiryStatus.valueOf(status.toUpperCase()),
                    pageable
            );
        } else if (authorId != null) {
            page = inquiryRepository.findByAuthorId(authorId, pageable);
        } else if (!"ALL".equalsIgnoreCase(status)) {
            page = inquiryRepository.findByStatus(InquiryStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            page = inquiryRepository.findAll(pageable);
        }
        return page.map(this::toDtoForAdmin);
    }

    /** 단건 조회(비밀글도 관리자면 바로 열람 가능) */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public InquiryResponse getOne(@PathVariable Long id) {
        Inquiry q = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의가 존재하지 않습니다."));
        return toDtoForAdmin(q);
    }

    /** 상태 변경: PENDING / ANSWERED */
    @PatchMapping("/{id}/status")
    @Transactional
    public InquiryResponse changeStatus(
            @PathVariable Long id,
            @RequestParam("value") String value
    ) {
        InquiryStatus newStatus = InquiryStatus.valueOf(value.toUpperCase());
        Inquiry q = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의가 존재하지 않습니다."));
        q.setStatus(newStatus);
        return toDtoForAdmin(q);
    }

    /** 관리자 답변 등록/수정 + 상태 ANSWERED 전환 */
    @PatchMapping("/{id}/answer")
    @Transactional
    public InquiryResponse answer(
            @PathVariable Long id,
            @RequestBody InquiryAnswerRequest request
    ) {
        Inquiry q = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의가 존재하지 않습니다."));

        q.setAnswerContent(request.answerContent());
        q.setStatus(InquiryStatus.ANSWERED);

        return toDtoForAdmin(q);
    }

    /** 삭제 */
    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable Long id) {
        if (!inquiryRepository.existsById(id)) {
            throw new IllegalArgumentException("이미 삭제되었거나 존재하지 않는 문의입니다.");
        }
        inquiryRepository.deleteById(id);
    }

    private InquiryResponse toDtoForAdmin(Inquiry q) {
        return new InquiryResponse(
                q.getId(),
                q.getTitle(),
                q.getContent(),
                q.isSecret(),
                q.getStatus().name(),
                q.getAuthor().getId(),
                q.getAuthor().getNickname(),
                true,
                true,
                q.getCreatedAt(),
                q.getUpdatedAt(),
                q.getAnswerContent() // ✅ 관리자 답변 포함
        );
    }
}
