package com.rentex.penalty.service;

import com.rentex.penalty.repository.PenaltyRepository;
import com.rentex.penalty.domain.Penalty;
import com.rentex.user.domain.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;

    public int getPenaltyPoint(Long userId) {
        return penaltyRepository.findByUserId(userId)
                .map(Penalty::getPoint)
                .orElse(0);
    }

    @Transactional
    public void addPenalty(Long userId, int score) {
        penaltyRepository.increasePenalty(userId, score);
    }

    @Transactional
    public void payPenalty(Long userId) {
        penaltyRepository.resetPenalty(userId);
    }

    public boolean isRentalRestricted(Long userId) {
        return getPenaltyPoint(userId) >= 3;
    }

    @Transactional
    public void createPenaltyIfAbsent(User user) {
        penaltyRepository.findByUserId(user.getId())
                .orElseGet(() -> penaltyRepository.save(
                    Penalty.builder()
                        .user(user)
                        .point(0)
                        .paid(false)
                        .build()
                ));
    }

    public void resetPenalty(User user) {
        Penalty penalty = penaltyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("벌점 정보가 존재하지 않습니다."));

        penalty.reset();
    }
}