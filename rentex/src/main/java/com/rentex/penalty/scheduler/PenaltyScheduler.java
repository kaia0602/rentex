package com.rentex.penalty.scheduler;

import com.rentex.penalty.service.PenaltyService;
import com.rentex.rental.domain.Rental;
import com.rentex.rental.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PenaltyScheduler {

    private final RentalRepository rentalRepository;
    private final PenaltyService penaltyService;
//    @Scheduled(cron = "*/10 * * * * *")
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void detectOverdueRentals() {
        List<Rental> overdueList = rentalRepository.findOverdueRentals(LocalDate.now());

        for (Rental rental : overdueList) {
            rental.markAsOverdue();
            penaltyService.increasePenalty(rental.getUser().getId(), 1);
        }

    }
}