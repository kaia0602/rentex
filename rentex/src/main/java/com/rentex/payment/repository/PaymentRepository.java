package com.rentex.payment.repository;

import com.rentex.payment.domain.Payment;
import com.rentex.user.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findAllByUser(User user);

    /** 운영자 순수익 = 모든 결제 금액의 30% */
    @Query("SELECT SUM(p.amount * 0.3) FROM Payment p")
    Long sumAdminRevenue();
}
