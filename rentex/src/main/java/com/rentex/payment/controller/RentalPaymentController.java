//package com.rentex.payment.controller;
//
//import com.rentex.payment.domain.Payment;
//import com.rentex.payment.domain.Payment.PaymentMethod;
//import com.rentex.payment.dto.PaymentResponseDTO;
//import com.rentex.rental.service.RentalService;
//import com.rentex.user.domain.User;
//import com.rentex.user.service.UserService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.security.Principal;
//
//@RestController
//@RequestMapping("/api/rentals")
//@RequiredArgsConstructor
//public class RentalPaymentController {
//
//    private final RentalService rentalService;
//    private final UserService userService;
//
//    /** 대여 결제 */
//    @PostMapping("/{rentalId}/pay")
//    public ResponseEntity<PaymentResponseDTO> payForRental(
//            @PathVariable Long rentalId,
//            @RequestParam PaymentMethod method,
//            @RequestParam int amount,
//            Principal principal
//    ) {
//        // principal에서 userId 추출 후 userService로 조회
//        User me = userService.getUserById(Long.parseLong(principal.getName()));
//        Payment payment = rentalService.payForRental(rentalId, method, me, amount);
//        return ResponseEntity.ok(PaymentResponseDTO.from(payment));
//    }
//}
