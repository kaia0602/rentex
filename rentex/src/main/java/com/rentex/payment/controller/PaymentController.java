
package com.rentex.payment.controller;

import com.rentex.payment.domain.Payment;
import com.rentex.payment.domain.Payment.PaymentMethod;
import com.rentex.payment.dto.PaymentDetailDTO;
import com.rentex.payment.dto.PaymentResponseDTO;
import com.rentex.payment.service.PaymentService;
import com.rentex.user.domain.User;
import com.rentex.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserService userService;

    @GetMapping("/payments")
    public List<PaymentResponseDTO> getPayments(Principal principal) {
        User user = userService.getUserById(Long.parseLong(principal.getName()));
        return paymentService.getPaymentHistory(user).stream()
                .map(PaymentResponseDTO::from)
                .toList();
    }

    // PaymentController.java
    @GetMapping("/payments/{id}")
    public PaymentDetailDTO getPaymentById(@PathVariable Long id, Principal principal) {
        User user = userService.getUserById(Long.parseLong(principal.getName()));
        Payment payment = paymentService.getByIdForUser(id, user); // 본인 소유 검증 포함
        return PaymentDetailDTO.from(payment);
    }

    @PostMapping("/pay-penalty")
    public PaymentResponseDTO payPenalty(
            @RequestParam PaymentMethod method,
            Principal principal
    ) {
        User user = userService.getUserById(Long.parseLong(principal.getName()));
        return PaymentResponseDTO.from(paymentService.processPenaltyPayment(user, method));
    }
}