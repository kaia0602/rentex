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

import java.util.List;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;
    private final RentalRepository rentalRepository;

    /** ✅ 유저 ID로 벌점 가져오기 */
    @Transactional(readOnly = true)
    public Penalty getPenaltyByUser(User user) {
        return penaltyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("벌점 정보가 없습니다."));
    }

    @Transactional(readOnly = true)
    public List<PenaltyWithRentalDTO> getPenaltyWithRentals(User user) {
        Penalty penalty = getPenaltyByUser(user);

        // 최신 3건만 조회
        List<Rental> rentals = rentalRepository
                .findRecentRentalsByUserId(user.getId(), PageRequest.of(0, 3));

        return rentals.stream()
                .map(r -> PenaltyWithRentalDTO.builder()
                        .penaltyId(penalty.getId())
                        .point(penalty.getPoint())
                        .paid(penalty.isPaid())
                        .itemName(r.getItem().getName())
                        .startDate(r.getStartDate())
                        .endDate(r.getEndDate())
                        .build()
                )
                .toList();
    }

    /** ✅ 벌점 초기화 (관리자) */
    @Transactional
    public void resetPenalty(User user) {
        Penalty p = getPenaltyByUser(user);
        p.reset();
    }

    /** ✅ 벌점 초기화 (userId) */
    @Transactional
    public void resetPenaltyByUserId(Long userId) {
        penaltyRepository.resetPenalty(userId);
    }

    /** ✅ 벌점 증가 */
    @Transactional
    public void increasePenalty(Long userId, int score) {
        penaltyRepository.increasePenalty(userId, score);
    }
}
