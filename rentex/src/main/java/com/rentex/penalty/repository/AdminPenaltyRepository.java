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

    /** 유저 목록 + 패널티 현황 조회 */
    public List<AdminPenaltyUserDTO> listUsers(String q, int limit, int offset) {
        var sql = """
            SELECT
              u.id   AS userId,
              u.name AS name,
              u.email AS email,
              (SELECT COALESCE(SUM(CASE WHEN p.status='VALID' THEN p.point ELSE 0 END), 0)
                 FROM penalty p WHERE p.user_id = u.id) AS penaltyPoints,
              (SELECT COUNT(*) FROM penalty p
                 WHERE p.user_id = u.id AND p.status = 'VALID') AS activeEntries,
              (SELECT MAX(up.given_at) FROM user_penalty up
                 WHERE up.user_id = u.id) AS lastGivenAt
            FROM users u
            WHERE (:q IS NULL OR :q = '' 
                   OR u.name LIKE CONCAT('%',:q,'%') 
                   OR u.email LIKE CONCAT('%',:q,'%'))
            ORDER BY penaltyPoints DESC, u.id DESC
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

    /** 특정 유저의 패널티 상세 내역 */
    public List<AdminPenaltyEntryDTO> userEntries(Long userId) {
        var sql = """
            SELECT id, reason, point, status, given_at
            FROM penalty
            WHERE user_id = :userId
            ORDER BY id DESC
            """;
        return jdbc.query(sql, Map.of("userId", userId), (rs, i) -> AdminPenaltyEntryDTO.builder()
                .id(rs.getLong("id"))
                .reason(rs.getString("reason"))
                .points(rs.getInt("point"))
                .status(rs.getString("status"))
                .givenAt(rs.getTimestamp("given_at").toLocalDateTime())
                .build());
    }

    /** 패널티 항목 삭제 처리 */
    public void deleteEntry(Long entryId) {
        var row = jdbc.queryForMap("SELECT user_id, point FROM penalty WHERE id = :id",
                Map.of("id", entryId));
        Long userId = ((Number)row.get("user_id")).longValue();
        int point = ((Number)row.get("point")).intValue();

        jdbc.update("""
            UPDATE user_penalty
               SET status = 'DELETED', deleted_at = NOW()
             WHERE id = :id AND status = 'VALID'
            """, Map.of("id", entryId));

        jdbc.update("""
            UPDATE users
               SET penalty_points = GREATEST(0, penalty_points - :p)
             WHERE id = :u
            """, Map.of("p", point, "u", userId));
    }

    /** 특정 유저의 패널티 초기화 */
    public void resetUser(Long userId) {
        jdbc.update("UPDATE users SET penalty_points = 0 WHERE id = :u", Map.of("u", userId));
        jdbc.update("""
            UPDATE user_penalty
               SET status = 'CLEARED', cleared_at = NOW()
             WHERE user_id = :u AND status = 'VALID'
            """, Map.of("u", userId));
    }
}
