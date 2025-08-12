package com.rentex.rental.service;

import com.rentex.item.domain.Item;
import com.rentex.item.repository.ItemRepository;
import com.rentex.rental.domain.ActionActor;
import com.rentex.rental.domain.Rental;
import com.rentex.rental.domain.RentalHistory;
import com.rentex.rental.domain.RentalStatus;
import com.rentex.rental.dto.RentalRequestDTO;
import com.rentex.rental.repository.RentalHistoryRepository;
import com.rentex.rental.repository.RentalRepository;
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final RentalHistoryRepository rentalHistoryRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;


    @Transactional
    public void requestReturn(Long rentalId, Long userId) {
        // 1. 대여 정보를 찾습니다.
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("해당 대여 정보를 찾을 수 없습니다."));

        // 2. 요청한 사용자가 실제 대여자인지 확인합니다.
        if (!rental.getUser().getId().equals(userId)) {
            throw new SecurityException("반납 요청을 할 권한이 없습니다.");
        }

        // 3. Rental 엔티티의 상태를 변경합니다. (내부적으로 '대여 중' 상태인지 확인)
        RentalStatus fromStatus = rental.getStatus();
        rental.requestReturn();
        RentalStatus toStatus = rental.getStatus();

        // 4. 변경 이력을 RentalHistory에 기록합니다.
        RentalHistory history = RentalHistory.of(rental, fromStatus, toStatus, ActionActor.USER, "사용자 반납 요청");
        rentalHistoryRepository.save(history);
    }

    @Transactional
    public Rental createRental(RentalRequestDTO requestDTO, Long userId) {
        // 1. 사용자를 찾습니다.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. 벌점 확인 로직 (핵심)
        if (user.getPenaltyPoints() >= 3) {
            throw new IllegalStateException("벌점이 3점 이상이어서 장비를 대여할 수 없습니다.");
        }

        // 3. 대여할 장비를 찾습니다.
        Item item = itemRepository.findById(requestDTO.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("장비를 찾을 수 없습니다."));

        // TODO: 장비 재고 확인 등 추가적인 비즈니스 로직

        // 5. 대여(Rental) 객체 생성 및 저장
        Rental newRental = Rental.builder()
                .user(user)
                .item(item)
                .quantity(requestDTO.getQuantity())
                .status(RentalStatus.REQUESTED) // 최초 상태는 '요청'
                .build();

        rentalRepository.save(newRental);

        // 6. 대여 기록(History) 생성 및 저장
        RentalHistory history = RentalHistory.of(newRental, null, RentalStatus.REQUESTED, ActionActor.USER, "사용자 대여 요청");
        rentalHistoryRepository.save(history);

        return newRental;
    }
}