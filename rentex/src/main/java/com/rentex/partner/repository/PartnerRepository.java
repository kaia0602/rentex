package com.rentex.partner.repository;

import com.rentex.partner.domain.Partner;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerRepository extends JpaRepository<Partner, Long> {
    boolean existsByBusinessNo(String businessNo);
}
