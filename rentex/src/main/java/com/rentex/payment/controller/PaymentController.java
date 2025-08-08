//package com.rentex.payment.controller;
//
//import com.rentex.payment.domain.Payment;
//import com.rentex.payment.domain.Payment.PaymentMethod;
//import com.rentex.payment.service.PaymentService;
//import com.rentex.user.domain.User;
//import com.rentex.user.service.UserService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.*;
//
//import java.security.Principal;
//import java.util.List;
//
//@RestController
//@RequestMapping("/mypage")
//@RequiredArgsConstructor
//public class PaymentController {
//
//    private final PaymentService paymentService;
//    private final UserService userService;
//
//    // 🧾 결제 이력 조회 API
//    @GetMapping("/payments")
//    public List<Payment> getPayments(Principal principal) {
//        User user = userService.getUserByEmail(principal.getName());
//        return paymentService.getPaymentHistory(user);
//    }
//
//    // 💳 벌점 결제 API
//    @PostMapping("/pay-penalty")
//    public Payment payPenalty(@RequestParam int amount,
//                              @RequestParam PaymentMethod method,
//                              Principal principal) {
//        User user = userService.getUserByEmail(principal.getName());
//        return paymentService.processPenaltyPayment(user, amount, method);
//    }
//}
