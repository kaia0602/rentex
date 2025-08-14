package com.rentex.partner.repository;

import com.rentex.partner.domain.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
import java.util.Optional;

public interface PartnerRepository extends JpaRepository<Partner, Long> {
    // 사업자 번호로 파트너를 찾는 메서드
    Optional<Partner> findByBusinessNo(String businessNo);
}
=======

public interface PartnerRepository extends JpaRepository<Partner, Long> {
    boolean existsByBusinessNo(String businessNo);
}
>>>>>>> origin/feature/admin-items
