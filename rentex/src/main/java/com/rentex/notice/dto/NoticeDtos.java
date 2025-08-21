// src/main/java/com/rentex/notice/dto/NoticeDtos.java
package com.rentex.notice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 공지사항 DTO 묶음
 * - list(): NoticeListResponse
 * - detail(): NoticeDetail
 * - create/update 요청 DTO 포함
 */
public final class NoticeDtos {

    /** 목록 한 줄 아이템 */
    public record NoticeListItem(
            Long id,
            String title,
            String authorName,
            LocalDateTime createdAt,
            Long commentCount
    ) {}

    /** 목록 응답 (페이징 메타 포함) */
    public record NoticeListResponse(
            List<NoticeListItem> content,
            int page,              // 요청 페이지(0-base)
            int size,              // 페이지 크기
            long totalElements,    // 전체 개수
            int totalPages         // 전체 페이지 수
    ) {}

    /** 상세 페이지에서 이전/다음 글 id */
    public record Adjacent(
            Long prevId,
            Long nextId
    ) {}

    /** 상세 페이지의 댓글 아이템 */
    public record CommentItem(
            Long id,
            Long authorId,
            String authorName,
            String content,
            LocalDateTime createdAt
    ) {}

    /** 상세 응답 */
    public record NoticeDetail(
            Long id,
            String title,
            String content,
            String authorName,
            LocalDateTime createdAt,
            List<CommentItem> comments,
            Adjacent adjacent
    ) {}

    /** 공지 생성 요청 */
    public record NoticeCreateRequest(
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 10_000) String content
    ) {}

    /** 공지 수정 요청 */
    public record NoticeUpdateRequest(
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 10_000) String content
    ) {}
}
