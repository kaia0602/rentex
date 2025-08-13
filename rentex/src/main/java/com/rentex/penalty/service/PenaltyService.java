package com.rentex.penalty.service;

import com.rentex.penalty.domain.Penalty;
import com.rentex.penalty.repository.PenaltyRepository;
import com.rentex.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;

    @Transactional(readOnly = true)
    public Penalty getPenaltyByUser(User user) {
        return penaltyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("벌점 정보가 없습니다."));
    }

    @Transactional
    public void resetPenalty(User user) {
        Penalty p = getPenaltyByUser(user);
        p.reset();
    }

    @Transactional
    public void resetPenaltyByUserId(Long userId) {
        penaltyRepository.resetPenalty(userId);
    }

    @Transactional
    public void increasePenalty(Long userId, int score) {
        penaltyRepository.increasePenalty(userId, score);
    }
}