package com.rentex.qna.repository;

import com.rentex.qna.domain.Inquiry;
import com.rentex.qna.domain.InquiryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    Page<Inquiry> findByAuthorId(Long authorId, Pageable pageable);
    Page<Inquiry> findByStatus(InquiryStatus status, Pageable pageable);
    Page<Inquiry> findByAuthorIdAndStatus(Long authorId, InquiryStatus status, Pageable pageable);
}