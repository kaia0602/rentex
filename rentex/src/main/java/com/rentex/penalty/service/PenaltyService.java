package com.rentex.penalty.service;

import com.rentex.penalty.domain.Penalty;
import com.rentex.penalty.dto.PenaltyWithRentalDTO;
import com.rentex.penalty.repository.PenaltyRepository;
import com.rentex.rental.domain.Rental;
import com.rentex.rental.repository.RentalRepository;
import com.rentex.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;
    private final RentalRepository rentalRepository;

<<<<<<< HEAD
    @Transactional
    public Penalty getPenaltyByUser(User user) {
        // 사용자의 벌점 정보를 찾고, 만약 없다면 orElseGet 내부 로직을 실행합니다.
        return penaltyRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Repository에 새로 추가한 네이티브 쿼리를 호출합니다.
                    penaltyRepository.createDefaultPenaltyForUser(user.getId());
                    // 추가된 정보를 다시 조회하여 반환합니다.
                    return penaltyRepository.findByUserId(user.getId())
                            .orElseThrow(() -> new IllegalStateException("기본 벌점 정보 생성에 실패했습니다."));
                });
    }


=======
    /** ✅ 유저의 전체 벌점 내역 조회 */
    @Transactional(readOnly = true)
    public List<Penalty> getPenaltiesByUser(User user) {
        return penaltyRepository.findByUser_Id(user.getId());
    }

    /** ✅ 가장 최신 벌점 가져오기 */
    @Transactional(readOnly = true)
    public Penalty getLatestPenalty(User user) {
        return penaltyRepository.findByUser_Id(user.getId()).stream()
                .max(Comparator.comparing(Penalty::getCreatedAt))
                .orElseThrow(() -> new IllegalArgumentException("벌점 정보가 없습니다."));
    }

    /** ✅ 최신 벌점 + 최근 대여 3건 */
    @Transactional(readOnly = true)
    public List<PenaltyWithRentalDTO> getPenaltyWithRentals(User user) {
        Penalty latestPenalty = getLatestPenalty(user);

        // 최신 3건만 조회
        List<Rental> rentals = rentalRepository
                .findRecentRentalsByUserId(user.getId(), PageRequest.of(0, 3));

        return rentals.stream()
                .map(r -> PenaltyWithRentalDTO.builder()
                        .penaltyId(latestPenalty.getId())
                        .point(latestPenalty.getPoint())
                        .paid(latestPenalty.isPaid())
                        .itemName(r.getItem().getName())
                        .startDate(r.getStartDate())
                        .endDate(r.getEndDate())
                        .build()
                )
                .toList();
    }

    /** ✅ 벌점 초기화 (== 유저의 모든 벌점을 paid 처리) */
>>>>>>> origin/feature/rentaladd
    @Transactional
    public void resetPenalty(User user) {
        List<Penalty> penalties = getPenaltiesByUser(user);
        penalties.forEach(Penalty::reset);
    }

    /** ✅ 벌점 증가 (새 row 생성) */
    @Transactional
    public void increasePenalty(User user, int score) {
        Penalty penalty = Penalty.builder()
                .user(user)
                .point(score)
                .paid(false)
                .build();
        penaltyRepository.save(penalty);
    }
<<<<<<< HEAD

    @Transactional
    public void increasePenalty(Long userId, int score) {
        penaltyRepository.increasePenalty(userId, score);
    }
=======
>>>>>>> origin/feature/rentaladd
}
