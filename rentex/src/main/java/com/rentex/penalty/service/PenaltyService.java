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
