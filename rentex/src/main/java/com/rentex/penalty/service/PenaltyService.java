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

    /**
     * 특정 사용자의 모든 벌점 내역을 조회합니다.
     *
     * @param user 조회할 사용자
     * @return 벌점 기록 리스트
     */
    @Transactional(readOnly = true)
    public List<Penalty> getPenaltiesByUser(User user) {
        return penaltyRepository.findByUser_Id(user.getId());
    }

    /**
     * 특정 사용자의 가장 최근 벌점 기록을 조회합니다.
     *
     * @param user 조회할 사용자
     * @return 가장 최근 Penalty 객체
     * @throws IllegalArgumentException 벌점 정보가 없는 경우
     */
    @Transactional(readOnly = true)
    public Penalty getLatestPenalty(User user) {
        return penaltyRepository.findByUser_Id(user.getId()).stream()
                .max(Comparator.comparing(Penalty::getCreatedAt))
                .orElseThrow(() -> new IllegalArgumentException("벌점 정보가 없습니다."));
    }

    /**
     * 특정 사용자의 최신 벌점 정보와 최근 대여 3건의 정보를 함께 조회합니다.
     *
     * @param user 조회할 사용자
     * @return 벌점과 대여 정보가 결합된 DTO 리스트
     */
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

    /**
     * 특정 사용자의 모든 벌점 기록을 초기화합니다. (모든 기록을 '납부 완료' 처리)
     *
     * @param user 초기화할 사용자
     */
    @Transactional
    public void resetPenalty(User user) {
        List<Penalty> penalties = getPenaltiesByUser(user);
        penalties.forEach(Penalty::reset);
    }

    /**
     * 특정 사용자에게 벌점을 부과합니다. (새로운 벌점 기록을 생성)
     *
     * @param user  벌점을 부과할 사용자
     * @param score 부과할 점수
     */
    @Transactional
    public void increasePenalty(User user, int score) {
        Penalty penalty = Penalty.builder()
                .user(user)
                .point(score)
                .paid(false)
                .build();
        penaltyRepository.save(penalty);
    }
}