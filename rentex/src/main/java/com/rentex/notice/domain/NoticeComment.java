package com.rentex.notice.domain;

import com.rentex.global.domain.BaseTimeEntity;
import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "notice_comment",
        indexes = {
                @Index(name = "idx_notice_comment_created", columnList = "notice_id, createdAt"),
                @Index(name = "idx_notice_comment_author", columnList = "author_id")
        }
)
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NoticeComment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notice_id", nullable = false)
    private Notice notice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id",  nullable = false)
    private User author;

    @Column(nullable = false, length = 500)
    private String comment;
}
