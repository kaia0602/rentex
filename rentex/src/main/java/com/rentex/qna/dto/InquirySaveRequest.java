package com.rentex.qna.dto;

public record InquirySaveRequest(
        String title,
        String content,
        boolean secret,
        String password // secret=true일 때 필수
) {}