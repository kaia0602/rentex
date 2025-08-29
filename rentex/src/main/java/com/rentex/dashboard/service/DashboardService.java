package com.rentex.dashboard.service;

import com.rentex.dashboard.dto.ActivityDTO;
import com.rentex.dashboard.dto.DashboardSummaryDTO;
import com.rentex.dashboard.dto.TrendPointDTO;
import com.rentex.item.domain.Item.ItemStatus;
import com.rentex.item.repository.ItemRepository;
import com.rentex.payment.repository.PaymentRepository;
import com.rentex.rental.domain.RentalStatus;
import com.rentex.rental.repository.RentalRepository;
import com.rentex.rental.repository.RentalHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final RentalRepository rentalRepository;
    private final ItemRepository itemRepository;
    private final RentalHistoryRepository rentalHistoryRepository;
    private final PaymentRepository paymentRepository; // 매출은 추후 연결

    /** 요약 카드 */
    public DashboardSummaryDTO getSummary(Authentication auth) {
        long total = rentalRepository.count();
        long active = rentalRepository.countByStatus(RentalStatus.RECEIVED); // 진행 중
        long available = itemRepository.countByStatus(ItemStatus.AVAILABLE);
        long overdue = rentalRepository.countByIsOverdueTrue();

        return new DashboardSummaryDTO(total, active, available, overdue);
    }

    /** 최근 7일 추이 (REQUESTED / RECEIVED / RETURNED) */
    public List<TrendPointDTO> getTrends(Authentication auth) {
        LocalDate today = LocalDate.now();
        LocalDateTime from = today.minusDays(6).atStartOfDay();
        LocalDateTime to = today.plusDays(1).atStartOfDay();

        List<Object[]> rows = rentalHistoryRepository.countDailyToStatus(from, to);

        // rows: [날짜, 상태, 개수]
        // 네이티브: 날짜는 java.sql.Date, 상태는 String(to_status)
        // JPQL: 날짜는 LocalDate, 상태는 RentalStatus
        Map<LocalDate, Map<RentalStatus, Long>> bucket = new TreeMap<>();

        for (Object[] r : rows) {
            // 날짜 파싱
            LocalDate day;
            Object dObj = r[0];
            if (dObj instanceof java.sql.Date sqlDate)      day = sqlDate.toLocalDate();
            else if (dObj instanceof LocalDate ld)          day = ld;
            else                                            day = LocalDate.parse(dObj.toString());

            // 상태 파싱
            RentalStatus status;
            Object sObj = r[1];
            if (sObj instanceof String s)                   status = RentalStatus.valueOf(s);
            else                                            status = (RentalStatus) sObj;

            long cnt = ((Number) r[2]).longValue();

            bucket.computeIfAbsent(day, k -> new EnumMap<>(RentalStatus.class))
                    .merge(status, cnt, Long::sum);
        }

        // 최근 7일 라벨/값 생성
        List<TrendPointDTO> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            Map<RentalStatus, Long> m = bucket.getOrDefault(d, Map.of());
            result.add(new TrendPointDTO(
                    dayKorean(d.getDayOfWeek()),
                    m.getOrDefault(RentalStatus.REQUESTED, 0L),
                    m.getOrDefault(RentalStatus.RECEIVED, 0L),
                    m.getOrDefault(RentalStatus.RETURNED, 0L)
            ));
        }
        return result;
    }

    /** 최근 활동 */
    public List<ActivityDTO> getActivities(Authentication auth, int limit) {
        var page = rentalHistoryRepository.findByOrderByCreatedAtDesc(PageRequest.of(0, limit));
        return page.getContent().stream()
                .map(h -> new ActivityDTO(
                        h.getId(),
                        h.getRental().getId(),
                        h.getRental().getItem().getName(),
                        h.getActorUser() != null ? h.getActorUser().getNickname() : h.getActor().name(),
                        h.getToStatus().name(),             // toStatus 사용
                        h.getCreatedAt()                    // BaseTimeEntity의 createdAt
                ))
                .collect(Collectors.toList());
    }

    private String dayKorean(java.time.DayOfWeek dow) {
        return switch (dow) {
            case MONDAY -> "월";
            case TUESDAY -> "화";
            case WEDNESDAY -> "수";
            case THURSDAY -> "목";
            case FRIDAY -> "금";
            case SATURDAY -> "토";
            case SUNDAY -> "일";
        };
    }
}
