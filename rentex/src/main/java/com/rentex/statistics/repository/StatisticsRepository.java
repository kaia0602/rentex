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

    // 필요 시 상태값 수정
    private static final String STATUS_FILTER = "('APPROVED','RENTED','RETURN_REQUESTED','RETURNED')";


    /** PartnerId 조회 (users.id 그대로 사용) */
    public Optional<Long> resolvePartnerIdByUserId(Long userId) {
        String sql = "SELECT id FROM users WHERE id = :uid AND role = 'PARTNER'";
        List<Long> r = jdbc.query(sql, new MapSqlParameterSource("uid", userId), (rs, i) -> rs.getLong("id"));
        return r.isEmpty() ? Optional.empty() : Optional.of(r.get(0));
    }


    /** 관리자 전체 파트너 정산 요약 */
    public List<AdminPartnerSummaryDTO> adminPartnerSummary(LocalDate from, LocalDate to) {
        String sql = """
        SELECT
          u.id   AS partnerId,
          u.name AS partnerName,
          COUNT(DISTINCT r.id) AS totalRentals,
          COALESCE(SUM(r.quantity), 0) AS totalQuantity,
          COALESCE(SUM(GREATEST(0,
             DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
          ), 0) AS totalDays,
          COALESCE(SUM(i.daily_price * r.quantity *
             GREATEST(0, DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
          ), 0) AS totalRevenue
        FROM users u
        JOIN item i   ON i.partner_id = u.id
        JOIN rental r ON r.item_id = i.id
        WHERE u.role = 'PARTNER'
          AND LEAST(DATE(r.end_date), DATE(:to)) >= GREATEST(DATE(r.start_date), DATE(:from))
          AND r.status IN """ + STATUS_FILTER + """
        GROUP BY u.id, u.name
        ORDER BY totalRevenue DESC
    """;

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





    /** 관리자 - 특정 파트너 아이템별 정산 */
    public List<AdminPartnerItemDetailDTO> adminPartnerItemDetails(Long partnerId, LocalDate from, LocalDate to) {
        String sql = """
            SELECT
              i.id   AS itemId,
              i.name AS itemName,
              COALESCE(SUM(r.quantity), 0) AS quantity,
              i.daily_price                AS unitPrice,
              COALESCE(SUM(GREATEST(0,
                 DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
              ), 0) AS days,
              i.daily_price *
              COALESCE(SUM(r.quantity *
                 GREATEST(0, DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
              ), 0) AS amount
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


    /** 파트너 월별 정산 */
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


    public List<PartnerMonthlyItemDetailDTO> partnerMonthlyItemDetails(Long partnerId, LocalDate from, LocalDate to) {
        String sql = """
            SELECT
              i.id   AS itemId,
              i.name AS itemName,
              COALESCE(SUM(r.quantity), 0) AS quantity,
              i.daily_price                AS unitPrice,
              COALESCE(SUM(GREATEST(0,
                 DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
              ), 0) AS days,
              i.daily_price *
              COALESCE(SUM(r.quantity *
                 GREATEST(0, DATEDIFF(LEAST(DATE(r.end_date), DATE(:to)), GREATEST(DATE(r.start_date), DATE(:from))) + 1)
              ), 0) AS amount
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


    public long countPartnerRentals(Long partnerId, LocalDate from, LocalDate to) {
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

    /** 파트너 전체 수익 (all-time) */
    public long partnerTotalRevenueAllTime(Long partnerId) {
        String sql = """
        SELECT COALESCE(SUM(i.daily_price * r.quantity *
            GREATEST(0, DATEDIFF(DATE(r.end_date), DATE(r.start_date)) + 1)
        ), 0) AS total
        FROM item i
        JOIN rental r ON r.item_id = i.id
        WHERE i.partner_id = :partnerId
          AND r.status IN """ + STATUS_FILTER + """
    """;

        var params = new MapSqlParameterSource().addValue("partnerId", partnerId);
        Long total = jdbc.queryForObject(sql, params, Long.class);
        return total == null ? 0L : total;
    }

}
