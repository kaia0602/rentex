
package com.rentex.payment.controller;

import com.rentex.payment.domain.Payment;
import com.rentex.payment.domain.Payment.PaymentMethod;
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
        User user = userService.getUserByEmail(principal.getName());
        return paymentService.getPaymentHistory(user).stream()
                .map(PaymentResponseDTO::from)
                .collect(Collectors.toList());
    }

    @PostMapping("/pay-penalty")
    public PaymentResponseDTO payPenalty(@RequestParam int amount,
                                      @RequestParam PaymentMethod method,
                                      Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        Payment payment = paymentService.processPenaltyPayment(user, amount, method);
        return PaymentResponseDTO.from(payment);
    }
}


