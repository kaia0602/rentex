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
    private final PenaltyService penaltyService; // 벌점 초기화를 위해

    public Payment processPenaltyPayment(User user, int amount, PaymentMethod method) {
        Payment payment = Payment.builder()
                .user(user)
                .amount(amount)
                .method(method)
                .status(PaymentStatus.SUCCESS)
                .paidAt(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);
        penaltyService.resetPenalty(user); // 벌점 초기화 로직 호출
        return saved;
    }

    public List<Payment> getPaymentHistory(User user) {
        return paymentRepository.findAllByUser(user);
    }
}
