package com.rentex.qna.service;

import com.rentex.qna.domain.Inquiry;
import com.rentex.qna.domain.InquiryStatus;
import com.rentex.qna.dto.InquiryAnswerRequest;
import com.rentex.qna.dto.InquirySaveRequest;
import com.rentex.qna.repository.InquiryRepository;
import com.rentex.user.domain.Role;
import com.rentex.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final PasswordEncoder passwordEncoder; // BCrypt

    /* 전체 조회 */
    @Transactional(readOnly = true)
    public Page<Inquiry> getAll(Pageable pageable) {
        return inquiryRepository.findAll(pageable);
    }

    /* 생성 */
    public Inquiry create(User actor, InquirySaveRequest req) {
        requireActorCreatable(actor); // USER/PARTNER/ADMIN 허용
        Inquiry q = new Inquiry();
        q.setAuthor(actor);
        q.setTitle(req.title());
        q.setContent(req.content());
        q.setSecret(req.secret());
        if (req.secret()) {
            requirePassword(req.password());
            q.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        q.setStatus(InquiryStatus.PENDING);
        return inquiryRepository.save(q);
    }

    /* 열람 규칙
     * - 공개글(secret=false): 누구나(비로그인 포함) 열람 OK
     * - 비밀글(secret=true): ADMIN은 비번 없이 OK, 그 외는 비밀번호 일치해야 OK
     */
    @Transactional(readOnly = true)
    public Inquiry getForView(Long id, User actorNullable, String passwordNullable) {
        Inquiry q = find(id);

        // 공개글은 누구나
        if (!q.isSecret()) return q;

        // 관리자 또는 작성자 본인은 무조건 허용
        if (isAdmin(actorNullable) ||
                (actorNullable != null && q.getAuthor().getId().equals(actorNullable.getId()))) {
            return q;
        }

        // 비번 입력한 경우 검증
        if (passwordNullable == null || passwordNullable.isBlank()) {
            throw new AccessDeniedException("비밀글 비밀번호가 필요합니다.");
        }

        String saved = q.getPasswordHash();
        boolean matched =
                (saved != null && passwordEncoder.matches(passwordNullable, saved)) // 해시 매칭
                        || (saved != null && saved.equals(passwordNullable));              // 평문 대비

        if (!matched) {
            throw new AccessDeniedException("비밀번호가 일치하지 않습니다.");
        }
        return q;
    }

    /* 수정: 작성자 또는 관리자 */
    public Inquiry update(Long id, User actor, InquirySaveRequest req) {
        Inquiry q = find(id);
        if (!canWrite(q, actor)) throw new AccessDeniedException("수정 권한이 없습니다.");

        q.setTitle(req.title());
        q.setContent(req.content());
        q.setSecret(req.secret());

        if (req.secret()) {
            if (req.password() != null && !req.password().isBlank()) {
                q.setPasswordHash(passwordEncoder.encode(req.password())); // 새 비번으로 교체
            } // 비번 미제공이면 기존 hash 유지
        } else {
            q.setPasswordHash(null); // 공개글로 전환 시 비번 삭제
        }
        return q;
    }

    /* 삭제: 작성자 또는 관리자 */
    public void delete(Long id, User actor) {
        Inquiry q = find(id);
        if (!canWrite(q, actor)) throw new AccessDeniedException("삭제 권한이 없습니다.");
        inquiryRepository.delete(q);
    }

    @Transactional(readOnly = true)
    public Page<Inquiry> getMyList(Long authorId, Pageable pageable) {
        return inquiryRepository.findByAuthorId(authorId, pageable);
    }

    // ===== helper =====
    private Inquiry find(Long id) {
        return inquiryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 문의가 없습니다."));
    }

    private boolean hasRole(User u, String role) {
        return u != null && u.getRole() != null && role.equalsIgnoreCase(u.getRole());
    }

    private boolean isAdmin(User u) { return hasRole(u, "ADMIN"); }

    private boolean canWrite(Inquiry q, User actor) {
        return actor != null && (isAdmin(actor) || q.getAuthor().getId().equals(actor.getId()));
    }

    private void requirePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("비밀글 비밀번호는 필수입니다.");
        }
    }

    private void requireActorCreatable(User actor) {
        if (actor == null) throw new AccessDeniedException("로그인이 필요합니다.");
        String r = actor.getRole();
        if (r == null) throw new AccessDeniedException("권한 정보가 없습니다.");
        r = r.toUpperCase();
        if (!( "USER".equals(r) || "PARTNER".equals(r) || "ADMIN".equals(r) )) {
            throw new AccessDeniedException("문의 작성 권한이 없습니다.");
        }
    }

    /* 관리자 답변 등록/수정 */
    public Inquiry answer(Long id, User admin, InquiryAnswerRequest req) {
        if (!isAdmin(admin)) throw new AccessDeniedException("관리자만 답변할 수 있습니다.");
        Inquiry q = find(id);
        q.setAnswerContent(req.answerContent());
        q.setStatus(InquiryStatus.ANSWERED);
        return q;
    }

}
