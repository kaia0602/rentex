package com.rentex.payment.service;

import com.rentex.payment.domain.Payment;
import com.rentex.payment.domain.Payment.PaymentMethod;
import com.rentex.payment.domain.Payment.PaymentStatus;
import com.rentex.payment.repository.PaymentRepository;
import com.rentex.penalty.domain.Penalty;
import com.rentex.user.domain.User;
import com.rentex.penalty.service.PenaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PenaltyService penaltyService;

    /**
     * 벌점 결제 처리 (시뮬레이션)
     */
    @Transactional
    public Payment processPenaltyPayment(User user, PaymentMethod method) {
        // ✅ 미납 벌점 전체 조회
        List<Penalty> penalties = penaltyService.getPenaltiesByUser(user)
                .stream()
                .filter(p -> !p.isPaid())
                .toList();

        int totalPoints = penalties.stream()
                .mapToInt(Penalty::getPoint)
                .sum();

        if (totalPoints <= 0) {
            throw new IllegalStateException("결제할 벌점이 없습니다.");
        }

        int amount = totalPoints * 10000;

        // 결제 엔티티 생성
        Payment payment = Payment.builder()
                .user(user)
                .amount(amount)
                .method(method)
                .status(PaymentStatus.PENDING)
                .paidAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // ✅ 결제 시뮬레이션 (3초 대기)
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 결제 성공 처리
        payment.updateStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        // ✅ 미납 벌점 전체 초기화
        penalties.forEach(Penalty::reset);

        return payment;
    }

    /** 결제 내역 조회 */
    public List<Payment> getPaymentHistory(User user) {
        return paymentRepository.findAllByUser(user);
    }
}
