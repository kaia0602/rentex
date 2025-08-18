package com.rentex.user.repository;

import com.rentex.admin.dto.UserResponseDTO;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /** 이메일로 단건 조회 */
    Optional<User> findByEmail(String email);

<<<<<<< HEAD
    /** 역할(Role) 기준 조회 (USER / PARTNER / ADMIN) */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints) " +
            "FROM User u WHERE u.role = :role")
    List<UserResponseDTO> findAllByRole(@Param("role") String role);

    /** 전체 유저 리스트 (관리자 전용) */
    @Query("SELECT new com.rentex.admin.dto.UserResponseDTO(" +
            "u.id, u.email, u.name, u.nickname, u.role, u.createdAt, u.penaltyPoints) " +
            "FROM User u")
    List<UserResponseDTO> findAllUsersForAdmin();
=======
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
>>>>>>> feature/admin-items
}

