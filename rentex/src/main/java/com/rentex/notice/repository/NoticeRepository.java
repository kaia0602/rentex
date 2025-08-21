package com.rentex.notice.repository;

import com.rentex.notice.domain.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NoticeRepository extends JpaRepository<Notice,Long> {
    @EntityGraph(attributePaths = {"author"})
    Page<Notice> findAll(Pageable pageable);

    Optional<Notice> findTopByIdLessThanOrderByIdDesc(long id);
    Optional<Notice> findTopByIdGreaterThanOrderByIdAsc(long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Notice n set n.viewCount = n.viewCount + 1 where  n.id = :id")
    int increaseViewCount(@Param("id")long id);
}
