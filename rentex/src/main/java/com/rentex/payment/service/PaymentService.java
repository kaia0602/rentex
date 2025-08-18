package com.rentex.payment.service;

import com.rentex.payment.domain.Payment;
import com.rentex.payment.domain.Payment.PaymentMethod;
import com.rentex.payment.domain.Payment.PaymentStatus;
import com.rentex.payment.repository.PaymentRepository;
import com.rentex.user.domain.User;
import com.rentex.penalty.service.PenaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    public Payment processPenaltyPayment(User user, PaymentMethod method) {
        int point = penaltyService.getPenaltyByUser(user).getPoint();
        int amount = point * 10000;

        if (point <= 0) {
            throw new IllegalStateException("결제할 벌점이 없습니다.");
        }

        Payment payment = Payment.builder()
                .user(user)
                .amount(amount)
                .method(method)
                .status(PaymentStatus.PENDING)
                .paidAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        payment.updateStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        penaltyService.resetPenalty(user);

        return payment;
    }

    public List<Payment> getPaymentHistory(User user) {
        return paymentRepository.findAllByUser(user);
    }
}
