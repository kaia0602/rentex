package com.rentex.penalty.service;

import com.rentex.penalty.domain.Penalty;
import com.rentex.penalty.dto.MyPenaltyResponseDTO;
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
    /**
     * 특정 사용자의 모든 벌점 내역을 조회합니다.
     *
     * @param user 조회할 사용자
     * @return 벌점 기록 리스트
     */
=======
    /** 유저의 전체 벌점 내역 조회 */
>>>>>>> 4b275517b6ab137d658e9425fba72aaf4ac47973
    @Transactional(readOnly = true)
    public List<Penalty> getPenaltiesByUser(User user) {
        return penaltyRepository.findByUser_Id(user.getId());
    }

<<<<<<< HEAD
    /**
     * 특정 사용자의 가장 최근 벌점 기록을 조회합니다.
     *
     * @param user 조회할 사용자
     * @return 가장 최근 Penalty 객체
     * @throws IllegalArgumentException 벌점 정보가 없는 경우
     */
=======
    /** 가장 최신 벌점 가져오기 */
>>>>>>> 4b275517b6ab137d658e9425fba72aaf4ac47973
    @Transactional(readOnly = true)
    public Penalty getLatestPenalty(User user) {
        return penaltyRepository.findByUser_Id(user.getId()).stream()
                .max(Comparator.comparing(Penalty::getCreatedAt))
                .orElseThrow(() -> new IllegalArgumentException("벌점 정보가 없습니다."));
    }

<<<<<<< HEAD
    /**
     * 특정 사용자의 최신 벌점 정보와 최근 대여 3건의 정보를 함께 조회합니다.
     *
     * @param user 조회할 사용자
     * @return 벌점과 대여 정보가 결합된 DTO 리스트
     */
=======
    /** 사용자 본인 벌점 전체 내역 조회 (entries + totalPoints) */
    @Transactional(readOnly = true)
    public MyPenaltyResponseDTO getMyPenalties(User user) {
        // 해당 유저 벌점 전체 조회
        List<Penalty> penalties = penaltyRepository.findAllByUserId(user.getId());

        // 유효한 벌점 총합 (예: VALID 상태만 합산)
        int totalPoints = penalties.stream()
                .filter(p -> p.getStatus().isValid()) // PenaltyStatus에 isValid() 같은 헬퍼 있으면 사용
                .mapToInt(Penalty::getPoint)
                .sum();

        // 미납 여부 (paid=false 있으면 true)
        boolean hasUnpaid = penalties.stream().anyMatch(p -> !p.isPaid());

        // DTO 변환
        List<MyPenaltyResponseDTO.EntryDto> entryDtos = penalties.stream()
                .map(MyPenaltyResponseDTO.EntryDto::from)
                .toList();

        return MyPenaltyResponseDTO.builder()
                .totalPoints(totalPoints)
                .hasUnpaid(hasUnpaid)
                .entries(entryDtos)
                .build();
    }

    /** 최신 벌점 + 최근 대여 3건 */
>>>>>>> 4b275517b6ab137d658e9425fba72aaf4ac47973
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

<<<<<<< HEAD
    /**
     * 특정 사용자의 모든 벌점 기록을 초기화합니다. (모든 기록을 '납부 완료' 처리)
     *
     * @param user 초기화할 사용자
     */
=======
    /** 벌점 초기화 (== 유저의 모든 벌점을 paid 처리) */
>>>>>>> 4b275517b6ab137d658e9425fba72aaf4ac47973
    @Transactional
    public void resetPenalty(User user) {
        List<Penalty> penalties = getPenaltiesByUser(user);
        penalties.forEach(Penalty::reset);
    }

<<<<<<< HEAD
    /**
     * 특정 사용자에게 벌점을 부과합니다. (새로운 벌점 기록을 생성)
     *
     * @param user  벌점을 부과할 사용자
     * @param score 부과할 점수
     */
=======
    /** 벌점 증가 (새 row 생성) */
>>>>>>> 4b275517b6ab137d658e9425fba72aaf4ac47973
    @Transactional
    public void increasePenalty(User user, int score) {
        Penalty penalty = Penalty.builder()
                .user(user)
                .point(score)
                .paid(false)
                .build();
        penaltyRepository.save(penalty);

        user.addPenalty(score); // User.penaltyPoints 값도 증가
    }
}