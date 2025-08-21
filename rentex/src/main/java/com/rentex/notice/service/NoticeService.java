package com.rentex.notice.service;

import com.rentex.notice.domain.Notice;
import com.rentex.notice.domain.NoticeComment;
import com.rentex.notice.dto.NoticeDtos.Adjacent;
import com.rentex.notice.dto.NoticeDtos.CommentItem;
import com.rentex.notice.dto.NoticeDtos.NoticeCreateRequest;
import com.rentex.notice.dto.NoticeDtos.NoticeDetail;
import com.rentex.notice.dto.NoticeDtos.NoticeListItem;
import com.rentex.notice.dto.NoticeDtos.NoticeListResponse;
import com.rentex.notice.dto.NoticeDtos.NoticeUpdateRequest;
import com.rentex.notice.repository.NoticeCommentRepository;
import com.rentex.notice.repository.NoticeRepository;
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepo;
    private final NoticeCommentRepository commentRepo;
    private final UserRepository userRepo;

    /**
     * 공지 목록 (10개 페이징 등)
     * - author N+1 방지: NoticeRepository.findAll에 @EntityGraph(author) 적용
     * - 댓글 수 일괄 집계 쿼리 사용
     */
    public NoticeListResponse list(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Notice> slice = noticeRepo.findAll(pageable);

        Set<Long> ids = slice.getContent().stream().map(Notice::getId).collect(Collectors.toSet());
        Map<Long, Long> countMap = ids.isEmpty()
                ? Collections.emptyMap()
                : commentRepo.countByNoticeIds(ids).stream()
                    .collect(Collectors.toMap(NoticeCommentRepository.IdCount::getNoticeId, NoticeCommentRepository.IdCount::getCnt));

        List<NoticeListItem> content = slice.getContent().stream().map(n ->
                new NoticeListItem(
                        n.getId(),
                        n.getTitle(),
                        n.getAuthor().getName(),
                        n.getCreatedAt(),
                        countMap.getOrDefault(n.getId(), 0L)
                )
        ).toList();

        return new NoticeListResponse(content, page, size, slice.getTotalElements(), slice.getTotalPages());
    }

    /**
     * 공지 상세
     * - 조회수는 JPQL로 증가 → 동시성 안전
     * - 이전/다음 글 id 포함
     * - 댓글 정렬 asc
     */
    @Transactional
    public NoticeDetail detail(Long id) {
        // 조회수 증가
        noticeRepo.increaseViewCount(id);

        Notice n = noticeRepo.findById(id).orElseThrow(() -> new NoSuchElementException("NOTICE_NOT_FOUND"));

        List<NoticeComment> comments = commentRepo.findByNoticeIdOrderByIdAsc(id);
        List<CommentItem> commentItems = comments.stream()
                .map(c -> new CommentItem(
                        c.getId(),
                        c.getAuthor().getId(),
                        c.getAuthor().getName(),
                        c.getComment(),
                        c.getCreatedAt()
                ))
                .toList();

        Long prevId = noticeRepo.findTopByIdLessThanOrderByIdDesc(id).map(Notice::getId).orElse(null);
        Long nextId = noticeRepo.findTopByIdGreaterThanOrderByIdAsc(id).map(Notice::getId).orElse(null);

        return new NoticeDetail(
                n.getId(),
                n.getTitle(),
                n.getContent(),
                n.getAuthor().getName(),
                n.getCreatedAt(),
                commentItems,
                new Adjacent(prevId, nextId)
        );
    }

    /** (ADMIN) 공지 생성 */
    @Transactional
    public Long create(Long adminUserId, NoticeCreateRequest req) {
        User admin = userRepo.findById(adminUserId).orElseThrow(() -> new NoSuchElementException("USER_NOT_FOUND"));
        Notice notice = Notice.builder()
                .author(admin)
                .title(req.title())
                .content(req.content())
                .viewCount(0)
                .build();
        return noticeRepo.save(notice).getId();
    }

    /** (ADMIN) 공지 수정 */
    @Transactional
    public void update(Long id, NoticeUpdateRequest req) {
        Notice n = noticeRepo.findById(id).orElseThrow(() -> new NoSuchElementException("NOTICE_NOT_FOUND"));
        n.changeTitle(req.title());
        n.changeContent(req.content());
        // JPA dirty checking
    }

    /** (ADMIN) 공지 삭제 (연관 댓글은 orphanRemoval/cascade=REMOVE로 자동 삭제) */
    @Transactional
    public void delete(Long id) {
        if (!noticeRepo.existsById(id)) throw new NoSuchElementException("NOTICE_NOT_FOUND");
        noticeRepo.deleteById(id);
    }

    /** 댓글 등록: USER/PARTNER/ADMIN 가능 */
    @Transactional
    public Long addComment(Long noticeId, Long loginUserId, String comment) {
        Notice notice = noticeRepo.findById(noticeId).orElseThrow(() -> new NoSuchElementException("NOTICE_NOT_FOUND"));
        User author = userRepo.findById(loginUserId).orElseThrow(() -> new NoSuchElementException("USER_NOT_FOUND"));

        NoticeComment c = NoticeComment.builder()
                .notice(notice)
                .author(author)
                .comment(comment)
                .build();

        return commentRepo.save(c).getId();
    }

    /**
     * 댓글 삭제
     * - 관리자: 아무 댓글이나 삭제
     * - 일반: 자신의 댓글만 삭제
     * → 쿼리에서 권한 검증까지 처리해 레이스/권한 체크를 단순화
     */
    @Transactional
    public void deleteComment(Long noticeId, Long commentId, Long loginUserId, boolean isAdmin) {
        int affected = isAdmin
                ? commentRepo.deleteByIdAndNoticeId(commentId, noticeId)
                : commentRepo.deleteByIdAndNoticeIdAndAuthorId(commentId, noticeId, loginUserId);

        if (affected == 0) throw new NoSuchElementException("COMMENT_NOT_FOUND_OR_NO_PERMISSION");
    }
}
