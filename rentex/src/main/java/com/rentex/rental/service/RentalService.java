package com.rentex.rental.service;

import com.rentex.item.domain.Item;
import com.rentex.item.repository.ItemRepository;
import com.rentex.rental.domain.ActionActor;
import com.rentex.rental.domain.Rental;
import com.rentex.rental.domain.RentalHistory;
import com.rentex.rental.domain.RentalStatus;
import com.rentex.rental.dto.*;
import com.rentex.rental.exception.*;
import com.rentex.rental.repository.RentalHistoryRepository;
import com.rentex.rental.repository.RentalRepository;
import com.rentex.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RentalService {

    private final ItemRepository itemRepository;
    private final RentalRepository rentalRepository;
    private final RentalHistoryRepository rentalHistoryRepository;

    // 대여 가능 여부 확인 API 처리
    public AvailabilityResponseDto checkAvailability(Long itemId, LocalDate startDate, LocalDate endDate) {
        List<Rental> conflicts = rentalRepository.findConflictingRentals(itemId, startDate, endDate);

        boolean isAvailable = conflicts.isEmpty();

        return new AvailabilityResponseDto(isAvailable, conflicts.stream()
                .map(r -> new AvailabilityResponseDto.ConflictPeriodDto(
                        r.getId(), r.getStartDate(), r.getEndDate()))
                .toList());
    }

    // 대여 요청 생성
    // 상태: REQUESTED
    // 처리: 재고 확인 → 중복 예약 확인 → Rental 저장 → 이력 저장
    public void requestRental(RentalRequestDto requestDto, User user) {
        Item item = itemRepository.findById(requestDto.itemId())
                .orElseThrow(() -> new ItemNotFoundException("해당 장비가 존재하지 않습니다."));

        if (item.getStockQuantity() < requestDto.quantity()) {
            throw new ItemUnavailableException("재고가 부족합니다.");
        }

        boolean isOverlapping = rentalRepository.existsByItemAndStatusIn(
                item,
                List.of(RentalStatus.REQUESTED, RentalStatus.APPROVED, RentalStatus.RENTED)
        );
        if (isOverlapping) {
            throw new ItemUnavailableException("이미 대여 중이거나 승인 대기 중인 장비입니다.");
        }

        Rental rental = Rental.builder()
                .user(user)
                .item(item)
                .quantity(requestDto.quantity())
                .status(RentalStatus.REQUESTED)
                .build();
        rentalRepository.save(rental);

        RentalHistory history = RentalHistory.of(
                rental,
                null,
                RentalStatus.REQUESTED,
                ActionActor.USER,
                "사용자가 대여 요청함"
        );
        rentalHistoryRepository.save(history);
    }

    // 대여 요청 승인
    // 상태: REQUESTED → APPROVED
    // 처리: 재고 확인 → 재고 차감 → 상태 변경 → 이력 저장
    public void approveRental(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("해당 대여 요청이 존재하지 않습니다."));

        if (rental.getStatus() != RentalStatus.REQUESTED) {
            throw new InvalidRentalStateException("승인할 수 없는 상태입니다.");
        }

        Item item = rental.getItem();

        if (item.getStockQuantity() < rental.getQuantity()) {
            throw new ItemUnavailableException("재고가 부족하여 승인할 수 없습니다.");
        }

        item.decreaseStock(rental.getQuantity());

        RentalStatus from = rental.getStatus();
        rental.changeStatus(RentalStatus.APPROVED);

        RentalHistory history = RentalHistory.of(
                rental,
                from,
                RentalStatus.APPROVED,
                ActionActor.ADMIN,
                "관리자가 대여를 승인함"
        );
        rentalHistoryRepository.save(history);
    }

    // 장비 수령 처리 (파트너)
    // 상태: APPROVED → RENTED
    // 처리: 수령 시간 기록, 상태 변경, 이력 저장
    public void startRental(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("해당 대여 정보를 찾을 수 없습니다."));

        rental.start();

        rentalHistoryRepository.save(
                RentalHistory.of(
                        rental,
                        RentalStatus.APPROVED,
                        RentalStatus.RENTED,
                        ActionActor.PARTNER,
                        "파트너가 장비를 수령했습니다."
                )
        );
    }

    // 사용자 반납 요청
    // 상태: RENTED → RETURN_REQUESTED
    // 처리: 상태 변경, 이력 저장
    public void requestReturn(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("해당 대여가 없습니다."));

        if (rental.getStatus() != RentalStatus.RENTED) {
            throw new InvalidRentalStateException("대여중 상태여야 반납 요청이 가능합니다.");
        }

        RentalStatus from = rental.getStatus();
        rental.changeStatus(RentalStatus.RETURN_REQUESTED);

        rentalHistoryRepository.save(RentalHistory.of(
                rental,
                from,
                RentalStatus.RETURN_REQUESTED,
                ActionActor.USER,
                "사용자가 반납을 요청했습니다."
        ));
    }

    // 반납 확정 처리 (관리자)
    // 상태: RETURN_REQUESTED → RETURNED
    // 처리: 반납 시간 기록, 상태 변경, 재고 복구, 이력 저장
    public void returnRental(Long rentalId, User adminUser) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("대여 내역이 존재하지 않습니다."));

        if (rental.getStatus() != RentalStatus.RETURN_REQUESTED) {
            throw new InvalidRentalStateException("반납 요청 상태가 아닙니다.");
        }

        rental.changeStatus(RentalStatus.RETURNED);
        rental.setReturnedAt(LocalDateTime.now());

        rental.getItem().increaseStock(rental.getQuantity());

        RentalHistory history = RentalHistory.of(
                rental,
                RentalStatus.RETURN_REQUESTED,
                RentalStatus.RETURNED,
                ActionActor.ADMIN,
                "관리자가 반납을 확인하였습니다."
        );
        rentalHistoryRepository.save(history);
    }

    // 사용자 본인의 대여 목록 조회 (필터 가능)
    public Page<RentalResponseDto> getMyRentals(User user, RentalStatus status, Pageable pageable) {
        Page<Rental> rentals = (status != null) ?
                rentalRepository.findByUserIdAndStatus(user.getId(), status, pageable) :
                rentalRepository.findByUserId(user.getId(), pageable);

        return rentals.map(RentalResponseDto::from);
    }

    // 대여 상세 조회 (본인만 가능)
    public RentalDetailResponseDto getRentalDetail(Long rentalId, User user) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("대여 내역을 찾을 수 없습니다."));

        if (!rental.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }

        return new RentalDetailResponseDto(
                rental.getId(),
                rental.getItem().getName(),
                rental.getQuantity(),
                rental.getStatus(),
                rental.getStartDate(),
                rental.getEndDate(),
                rental.getRentedAt(),
                rental.getReturnedAt()
        );
    }

    // 대여 가능 여부 단순 확인 (빈 리스트 반환용)
    public AvailabilityResponseDto checkItemAvailability(Long itemId, LocalDate startDate, LocalDate endDate) {
        boolean existsConflict = rentalRepository.existsConflictingRental(itemId, startDate, endDate);
        return new AvailabilityResponseDto(
                !existsConflict,
                Collections.emptyList()
        );
    }

    // 특정 대여의 히스토리 리스트 조회
    public List<RentalHistoryResponseDto> getRentalHistory(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("해당 대여가 존재하지 않습니다."));

        return rentalHistoryRepository.findByRentalOrderByCreatedAtAsc(rental)
                .stream()
                .map(history -> new RentalHistoryResponseDto(
                        history.getFromStatus(),
                        history.getToStatus(),
                        history.getActor(),
                        history.getDescription(),
                        history.getCreatedAt()
                ))
                .toList();
    }

    // 전체 대여 목록 조회 (관리자용)
    public Page<RentalResponseDto> getAllRentals(RentalStatus status, Pageable pageable) {
        Page<Rental> rentals = (status != null)
                ? rentalRepository.findAllByStatus(status, pageable)
                : rentalRepository.findAll(pageable);

        return rentals.map(RentalResponseDto::from);
    }
}