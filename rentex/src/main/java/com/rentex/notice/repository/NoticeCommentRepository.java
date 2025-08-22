package com.rentex.notice.repository;

import com.rentex.notice.domain.NoticeComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface NoticeCommentRepository extends JpaRepository<NoticeComment, Long> {
    List<NoticeComment> findByNoticeIdOrderByIdAsc(Long noticeId);

    List<NoticeComment> findByNoticeIdOrderByCreatedAtDesc(Long noticeId);

    Long countByNoticeId(Long noticeId);

    interface IdCount {
        Long getNoticeId();
        Long getCnt();
    }

    @Query("""
    SELECT c.notice.id as noticeId, count(c) as cnt
    from NoticeComment c
    where c.notice.id in :ids
    group by c.notice.id      
    """)
    List<IdCount> countByNoticeIds(@Param("ids") Set<Long> noticeIds);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    int deleteByIdAndNoticeIdAndAuthorId(Long id, Long noticeId, Long authorId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    int deleteByIdAndNoticeId(Long id, Long noticeId);

    Optional<NoticeComment> findByIdAndNoticeId(Long id, Long noticeId);


}
