package com.rentex.user.repository;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 *  임시용 UserRepository
 * 테스트용 유저 조회 (findById)만 사용하며, 추후 JWT 인증 연동 시 삭제 또는 교체
 *
 * TODO: 이후 팀원(User 도메인 담당자)이 정식 UserRepository 구현 시 이 파일 삭제할 것
 */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(u.id, u.email, u.name, u.nickname,  u.role, u.createdAt, u.penaltyPoints) " +
            "FROM User u " + "WHERE u.role = 'USER'")
    List<UserResponseDTO> findAllUsers();

    @Query(value = "SELECT u.id FROM user u WHERE u.email = :email LIMIT 1", nativeQuery = true)
    Long findUserIdByEmail(@Param("email") String email);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE `user` SET penalty_points = COALESCE(penalty_points,0) + :delta WHERE id = :id", nativeQuery = true)
    int increasePenaltyPoints(@Param("id") Long userId, @Param("delta") int delta);  // ← int 로!

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE `user` SET penalty_points = GREATEST(0, COALESCE(penalty_points,0) - :delta) WHERE id = :id", nativeQuery = true)
    int decreasePenaltyPoints(@Param("id") Long userId, @Param("delta") int delta);  // ← int

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE `user` SET penalty_points = 0 WHERE id = :id", nativeQuery = true)
    int resetPenaltyPoints(@Param("id") Long userId);                                 // ← int

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        UPDATE `user` u
        SET u.penalty_points = (
          SELECT COALESCE(SUM(CASE WHEN up.status='VALID' THEN up.points ELSE 0 END),0)
          FROM user_penalty up WHERE up.user_id = :id
        )
        WHERE u.id = :id
        """, nativeQuery = true)
    int recalcPenaltyPoints(@Param("id") Long userId);                                 // ← int
}

