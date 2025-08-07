package com.rentex.penalty.service;

import com.rentex.penalty.dto.PartnerStatisticsDto;
import com.rentex.rental.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PartnerStatisticsService {

    private final RentalRepository rentalRepository;

    public List<PartnerStatisticsDto> getStatistics() {
        return rentalRepository.getPartnerStatistics();
    }
}
