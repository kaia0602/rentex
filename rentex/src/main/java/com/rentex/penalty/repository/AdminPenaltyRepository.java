package com.rentex.penalty.repository;

import com.rentex.penalty.dto.AdminPenaltyEntryDTO;
import com.rentex.penalty.dto.AdminPenaltyUserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.*;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
@RequiredArgsConstructor
public class AdminPenaltyRepository {
    private final NamedParameterJdbcTemplate jdbc;

    public List<AdminPenaltyUserDTO> listUsers(String q, int limit, int offset) {
        var sql = """
            SELECT
              u.id              AS userId,
              u.name            AS name,
              u.email           AS email,
              u.penalty_points  AS penaltyPoints,
              (SELECT COUNT(*) FROM user_penalty up
                 WHERE up.user_id = u.id AND up.status = 'VALID') AS activeEntries,
              (SELECT MAX(up.given_at) FROM user_penalty up
                 WHERE up.user_id = u.id) AS lastGivenAt
            FROM `user` u
            WHERE (:q IS NULL OR :q = '' OR u.name LIKE CONCAT('%',:q,'%') OR u.email LIKE CONCAT('%',:q,'%'))
            ORDER BY u.penalty_points DESC, u.id DESC
            LIMIT :limit OFFSET :offset
            """;
        var params = new MapSqlParameterSource()
                .addValue("q", q)
                .addValue("limit", limit)
                .addValue("offset", offset);
        return jdbc.query(sql, params, (rs, i) -> AdminPenaltyUserDTO.builder()
                .userId(rs.getLong("userId"))
                .name(rs.getString("name"))
                .email(rs.getString("email"))
                .penaltyPoints(rs.getInt("penaltyPoints"))
                .activeEntries(rs.getInt("activeEntries"))
                .lastGivenAt(Optional.ofNullable(rs.getTimestamp("lastGivenAt"))
                        .map(ts -> ts.toLocalDateTime()).orElse(null))
                .build());
    }

    public List<AdminPenaltyEntryDTO> userEntries(Long userId) {
        var sql = """
            SELECT id, reason, points, status, given_at
            FROM user_penalty
            WHERE user_id = :userId
            ORDER BY id DESC
            """;
        return jdbc.query(sql, Map.of("userId", userId), (rs, i) -> AdminPenaltyEntryDTO.builder()
                .id(rs.getLong("id"))
                .reason(rs.getString("reason"))
                .points(rs.getInt("points"))
                .status(rs.getString("status"))
                .givenAt(rs.getTimestamp("given_at").toLocalDateTime())
                .build());
    }

    public void addEntry(Long userId, String reason, int points) {
        var sql = """
            INSERT INTO user_penalty(user_id, reason, points, status, given_at)
            VALUES (:userId, :reason, :points, 'VALID', NOW())
            """;
        jdbc.update(sql, Map.of("userId", userId, "reason", reason, "points", points));
        jdbc.update("UPDATE `user` SET penalty_points = penalty_points + :p WHERE id = :u",
                Map.of("p", points, "u", userId));
    }

    public void deleteEntry(Long entryId) {
        // points와 userId를 먼저 구한 뒤 상태 변경 및 포인트 차감
        var row = jdbc.queryForMap("SELECT user_id, points FROM user_penalty WHERE id = :id",
                Map.of("id", entryId));
        Long userId = ((Number)row.get("user_id")).longValue();
        int points = ((Number)row.get("points")).intValue();

        jdbc.update("""
            UPDATE user_penalty
               SET status = 'DELETED', deleted_at = NOW()
             WHERE id = :id AND status = 'VALID'
            """, Map.of("id", entryId));

        jdbc.update("""
            UPDATE `user`
               SET penalty_points = GREATEST(0, penalty_points - :p)
             WHERE id = :u
            """, Map.of("p", points, "u", userId));
    }

    public void resetUser(Long userId) {
        jdbc.update("UPDATE `user` SET penalty_points = 0 WHERE id = :u", Map.of("u", userId));
        jdbc.update("""
            UPDATE user_penalty
               SET status = 'CLEARED', cleared_at = NOW()
             WHERE user_id = :u AND status = 'VALID'
            """, Map.of("u", userId));
    }
}
