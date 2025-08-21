package com.rentex.notice.domain;

import com.rentex.global.domain.BaseTimeEntity;
import com.rentex.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notice",
indexes = {
        @Index(name = "idx_notice_created_at", columnList = "createdAt"),
        @Index(name = "ide_notice_author", columnList = "author_id")
})
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    private int viewCount;

    @OneToMany(mappedBy = "notice", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<NoticeComment> comments = new ArrayList<>();

    public void changeTitle(String title){
        this.title = title;
    }
    public void changeContent(String content){
        this.content = content;
    }
//    public void increaseViewCount() {
//        this.viewCount++;
//    }
}

