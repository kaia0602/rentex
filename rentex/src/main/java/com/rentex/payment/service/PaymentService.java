package com.rentex.payment.service;

import com.rentex.payment.domain.Payment;
import com.rentex.payment.domain.Payment.PaymentMethod;
import com.rentex.payment.domain.Payment.PaymentStatus;
import com.rentex.payment.domain.PaymentType;
import com.rentex.payment.repository.PaymentRepository;
import com.rentex.penalty.domain.Penalty;
import com.rentex.penalty.service.PenaltyService;
import com.rentex.user.domain.User;
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
     * ✅ 벌점 결제 처리
     */
    @Transactional
    public Payment processPenaltyPayment(User user, PaymentMethod method) {
        // 미납 벌점 전체 조회
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

        int amount = totalPoints * 10000; // 벌점 1점 = 10,000원 (예시)

        // Payment 엔티티 생성
        Payment payment = Payment.builder()
                .user(user)
                .amount(amount)
                .method(method)
                .status(PaymentStatus.PENDING)
                .type(PaymentType.PENALTY)   // ✅ 벌점 결제
                .paidAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // 결제 시뮬레이션
        try { Thread.sleep(3000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

        // 결제 성공 처리
        payment.updateStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        // 벌점 초기화
        penalties.forEach(Penalty::reset);   // Penalty 엔티티 paid 처리
        penaltyService.resetPenalty(user);   // 벌점 엔트리 전체 paid 처리
        user.resetPenaltyPoints();           // ✅ User 엔티티 벌점 수치 초기화

        return payment;
    }

    /**
     * ✅ 대여 결제 처리
     */
    @Transactional
    public Payment processRentalPayment(User user, int amount, PaymentMethod method) {
        Payment payment = Payment.builder()
                .user(user)
                .amount(amount)
                .method(method)
                .status(PaymentStatus.PENDING)
                .type(PaymentType.RENTAL)    // ✅ 대여 결제
                .paidAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // 결제 시뮬레이션
        try { Thread.sleep(2000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

        payment.updateStatus(PaymentStatus.SUCCESS);
        return paymentRepository.save(payment);
    }

    /**
     * ✅ 결제 내역 조회
     */
    @Transactional(readOnly = true)
    public List<Payment> getPaymentHistory(User user) {
        return paymentRepository.findAllByUser(user);
    }
}
