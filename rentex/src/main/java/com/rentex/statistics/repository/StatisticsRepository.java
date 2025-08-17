// src/main/java/com/rentex/statistics/repository/StatisticsJdbcRepository.java
package com.rentex.statistics.repository;

import com.rentex.statistics.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class StatisticsRepository {

    private final NamedParameterJdbcTemplate jdbc;

    // 필요 시 여기만 상태값 맞춰서 수정
    private static final String STATUS_FILTER = "('APPROVED','RENTED','RETURN_REQUESTED','RETURNED')";


    public Optional<Long> resolvePartnerIdByUserId(Long userId) {
        // Case 1: user 테이블에 partner_id가 있는 경우
        String q1 = "SELECT u.partner_id AS pid FROM `user` u WHERE u.id = :uid AND u.partner_id IS NOT NULL LIMIT 1";
        List<Long> r1 = jdbc.query(q1, new MapSqlParameterSource("uid", userId), (rs, i) -> rs.getLong("pid"));
        if (!r1.isEmpty()) return Optional.of(r1.get(0));

        // Case 2: partner 테이블에 user_id가 있는 경우
        String q2 = "SELECT p.id AS pid FROM partner p WHERE p.user_id = :uid LIMIT 1";
        List<Long> r2 = jdbc.query(q2, new MapSqlParameterSource("uid", userId), (rs, i) -> rs.getLong("pid"));
        if (!r2.isEmpty()) return Optional.of(r2.get(0));

        return Optional.empty();
    }

    // 1) partner의 표시용 이름 컬럼을 동적으로 찾기
    private String partnerNameExpr() {
        // 우선순위: name > partner_name > company_name > title
        String sql = """
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'partner'
          AND COLUMN_NAME IN ('name','partner_name','company_name','title')
        ORDER BY FIELD(COLUMN_NAME,'name','partner_name','company_name','title')
        LIMIT 1
    """;
        var cols = jdbc.query(sql, (rs, i) -> rs.getString(1));
        if (cols.isEmpty()) {
            // 컬럼이 없으면 partnerId를 문자열로 표시
            return "CAST(p.id AS CHAR)";
        }
        // p.<찾은컬럼>
        return "p." + cols.get(0);
    }

    // 2) 관리자 합계 쿼리 (p.name 부분만 동적 표현식으로 교체)
    public List<AdminPartnerSummaryDTO> adminPartnerSummary(LocalDate from, LocalDate to) {
        String nameExpr = partnerNameExpr(); // ← 여기서 이름 표현식 확보
        String sql = """
        SELECT
          p.id   AS partnerId,
          %s     AS partnerName,
          COUNT(DISTINCT r.id)                                                                 AS totalRentals,
          COALESCE(SUM(r.quantity), 0)                                                         AS totalQuantity,
          COALESCE(SUM(GREATEST(0,
             DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
          ), 0)                                                                               AS totalDays,
          COALESCE(SUM(i.daily_price * r.quantity *
             GREATEST(0, DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
          ), 0)                                                                               AS totalRevenue
        FROM partner p
        JOIN item i   ON i.partner_id = p.id
        JOIN rental r ON r.item_id = i.id
        WHERE LEAST(DATE(r.end_date), DATE(:to)) >= GREATEST(DATE(r.start_date), DATE(:from))
          AND r.status IN ('APPROVED','RENTED','RETURN_REQUESTED','RETURNED')
        GROUP BY p.id, %s
        ORDER BY totalRevenue DESC
    """.formatted(nameExpr, nameExpr);

        var params = new MapSqlParameterSource()
                .addValue("from", from)
                .addValue("to", to);

        return jdbc.query(sql, params, (rs, i) -> AdminPartnerSummaryDTO.builder()
                .partnerId(rs.getLong("partnerId"))
                .partnerName(rs.getString("partnerName"))
                .totalRentals(rs.getLong("totalRentals"))
                .totalQuantity(rs.getLong("totalQuantity"))
                .totalDays(rs.getLong("totalDays"))
                .totalRevenue(rs.getLong("totalRevenue"))
                .build());
    }


    public List<AdminPartnerItemDetailDTO> adminPartnerItemDetails(Long partnerId, LocalDate from, LocalDate to) {
        String sql = """
            SELECT
              i.id   AS itemId,
              i.name AS itemName,
              COALESCE(SUM(r.quantity), 0) AS quantity,
              i.daily_price                AS unitPrice,
              COALESCE(SUM(GREATEST(0,
                 DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
              ), 0)                         AS days,
              i.daily_price *
              COALESCE(SUM(r.quantity *
                 GREATEST(0, DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
              ), 0)                         AS amount
            FROM item i
            JOIN rental r ON r.item_id = i.id
            WHERE i.partner_id = :partnerId
              AND LEAST(DATE(r.end_date), DATE(:to)) >= GREATEST(DATE(r.start_date), DATE(:from))
              AND r.status IN """ + STATUS_FILTER + """
            GROUP BY i.id, i.name, i.daily_price
            ORDER BY amount DESC
        """;

        var params = new MapSqlParameterSource()
                .addValue("partnerId", partnerId)
                .addValue("from", from)
                .addValue("to", to);

        return jdbc.query(sql, params, (rs, i) -> AdminPartnerItemDetailDTO.builder()
                .itemId(rs.getLong("itemId"))
                .itemName(rs.getString("itemName"))
                .quantity(rs.getLong("quantity"))
                .unitPrice(rs.getLong("unitPrice"))
                .days(rs.getLong("days"))
                .amount(rs.getLong("amount"))
                .build());
    }

    public PartnerMonthlyStatementDTO partnerMonthlyByPartnerId(Long partnerId, YearMonth ym) {
        var from = ym.atDay(1);
        var to   = ym.atEndOfMonth();

        List<PartnerMonthlyItemDetailDTO> details = partnerMonthlyItemDetails(partnerId, from, to);

        long totalRentals = countPartnerRentals(partnerId, from, to);
        long totalQuantity = details.stream().mapToLong(PartnerMonthlyItemDetailDTO::getQuantity).sum();
        long totalDays     = details.stream().mapToLong(PartnerMonthlyItemDetailDTO::getDays).sum();
        long totalRevenue  = details.stream().mapToLong(PartnerMonthlyItemDetailDTO::getAmount).sum();

        return PartnerMonthlyStatementDTO.builder()
                .year(ym.getYear())
                .month(ym.getMonthValue())
                .totalRentals(totalRentals)
                .totalQuantity(totalQuantity)
                .totalDays(totalDays)
                .totalRevenue(totalRevenue)
                .details(details)
                .build();
    }

    private List<PartnerMonthlyItemDetailDTO> partnerMonthlyItemDetails(Long partnerId, LocalDate from, LocalDate to) {
        String sql = """
            SELECT
              i.id   AS itemId,
              i.name AS itemName,
              COALESCE(SUM(r.quantity), 0) AS quantity,
              i.daily_price                AS unitPrice,
              COALESCE(SUM(GREATEST(0,
                 DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
              ), 0)                         AS days,
              i.daily_price *
              COALESCE(SUM(r.quantity *
                 GREATEST(0, DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
              ), 0)                         AS amount
            FROM item i
            JOIN rental r ON r.item_id = i.id
            WHERE i.partner_id = :partnerId
              AND LEAST(DATE(r.end_date), DATE(:to)) >= GREATEST(DATE(r.start_date), DATE(:from))
              AND r.status IN """ + STATUS_FILTER + """
            GROUP BY i.id, i.name, i.daily_price
            ORDER BY amount DESC
        """;

        var params = new MapSqlParameterSource()
                .addValue("partnerId", partnerId)
                .addValue("from", from)
                .addValue("to", to);

        return jdbc.query(sql, params, (rs, i) -> PartnerMonthlyItemDetailDTO.builder()
                .itemId(rs.getLong("itemId"))
                .itemName(rs.getString("itemName"))
                .quantity(rs.getLong("quantity"))
                .unitPrice(rs.getLong("unitPrice"))
                .days(rs.getLong("days"))
                .amount(rs.getLong("amount"))
                .build());
    }

    private long countPartnerRentals(Long partnerId, LocalDate from, LocalDate to) {
        String sql = """
            SELECT COUNT(DISTINCT r.id) AS cnt
            FROM item i
            JOIN rental r ON r.item_id = i.id
            WHERE i.partner_id = :partnerId
              AND LEAST(DATE(r.end_date), DATE(:to)) >= GREATEST(DATE(r.start_date), DATE(:from))
              AND r.status IN """ + STATUS_FILTER + """
        """;
        var params = new MapSqlParameterSource()
                .addValue("partnerId", partnerId)
                .addValue("from", from)
                .addValue("to", to);

        Long cnt = jdbc.queryForObject(sql, params, Long.class);
        return cnt == null ? 0L : cnt;
    }
}
