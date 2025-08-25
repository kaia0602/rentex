package com.rentex.qna.dto;

import java.time.LocalDateTime;

public record InquiryResponse(
        Long id,
        String title,
        String content,
        boolean secret,
        String status,
        Long authorId,
        String authorNickname,
        boolean editable,   // 작성자/관리자면 true
        boolean deletable,  // 작성자/관리자면 true
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String answerContent   // 관리자 답변
) {}
