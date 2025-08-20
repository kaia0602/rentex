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

    // 대여 요청 생성 (USER 또는 ADMIN)
    public void requestRental(RentalRequestDto requestDto, User actor) {
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
                .user(actor) // ADMIN도 직접 요청 가능
                .item(item)
                .quantity(requestDto.quantity())
                .startDate(requestDto.startDate())   // ✅ 추가
                .endDate(requestDto.endDate())       // ✅ 추가
                .status(RentalStatus.REQUESTED)
                .build();
        rentalRepository.save(rental);

        rentalHistoryRepository.save(RentalHistory.of(
                rental,
                null,
                RentalStatus.REQUESTED,
                getActorType(actor),
                actor.getRole() + "가 대여 요청함"
        ));
    }

    // 대여 요청 승인 (PARTNER 또는 ADMIN)
    public void approveRental(Long rentalId, User actor) {
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

        rentalHistoryRepository.save(RentalHistory.of(
                rental,
                from,
                RentalStatus.APPROVED,
                getActorType(actor),
                actor.getRole() + "가 대여를 승인함"
        ));
    }

    // 장비 수령 처리 (PARTNER 또는 ADMIN)
    public void startRental(Long rentalId, User actor) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("해당 대여 정보를 찾을 수 없습니다."));

        if (rental.getStatus() != RentalStatus.APPROVED) {
            throw new InvalidRentalStateException("승인 상태여야 수령이 가능합니다.");
        }

        rental.start();

        rentalHistoryRepository.save(
                RentalHistory.of(
                        rental,
                        RentalStatus.APPROVED,
                        RentalStatus.RENTED,
                        getActorType(actor),
                        actor.getRole() + "가 장비를 수령 처리함"
                )
        );
    }

    // 반납 요청 (USER 또는 ADMIN)
    public void requestReturn(Long rentalId, User actor) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("해당 대여가 없습니다."));

        if (rental.getStatus() != RentalStatus.RENTED) {
            throw new InvalidRentalStateException("대여중 상태여야 반납 요청이 가능합니다.");
        }

        // ADMIN은 누구의 Rental이든 반납 요청 가능
        if (!rental.getUser().getId().equals(actor.getId())
                && !"ADMIN".equals(actor.getRole())) {
            throw new AccessDeniedException("본인 대여건만 반납 요청 가능합니다.");
        }

        RentalStatus from = rental.getStatus();
        rental.changeStatus(RentalStatus.RETURN_REQUESTED);

        rentalHistoryRepository.save(RentalHistory.of(
                rental,
                from,
                RentalStatus.RETURN_REQUESTED,
                getActorType(actor),
                actor.getRole() + "가 반납을 요청했습니다."
        ));
    }

    // 반납 확정 처리 (PARTNER 또는 ADMIN)
    public void returnRental(Long rentalId, User actor) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("대여 내역이 존재하지 않습니다."));

        if (rental.getStatus() != RentalStatus.RETURN_REQUESTED) {
            throw new InvalidRentalStateException("반납 요청 상태가 아닙니다.");
        }

        rental.changeStatus(RentalStatus.RETURNED);
        rental.setReturnedAt(LocalDateTime.now());
        rental.getItem().increaseStock(rental.getQuantity());

        rentalHistoryRepository.save(RentalHistory.of(
                rental,
                RentalStatus.RETURN_REQUESTED,
                RentalStatus.RETURNED,
                getActorType(actor),
                actor.getRole() + "가 반납을 확인하였습니다."
        ));
    }

    // 사용자 본인의 대여 목록 조회
    public Page<RentalResponseDto> getMyRentals(User user, RentalStatus status, Pageable pageable) {
        Page<Rental> rentals = (status != null) ?
                rentalRepository.findByUserIdAndStatus(user.getId(), status, pageable) :
                rentalRepository.findByUserId(user.getId(), pageable);

        return rentals.map(RentalResponseDto::from);
    }

    // 대여 상세 조회 (본인만 가능, 단 ADMIN은 전체 가능)
    public RentalDetailResponseDto getRentalDetail(Long rentalId, User actor) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("대여 내역을 찾을 수 없습니다."));

        if (!rental.getUser().getId().equals(actor.getId())
                && !"ADMIN".equals(actor.getRole())) {
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
                rental.getReturnedAt(),
                rental.getItem().getThumbnailUrl()
        );
    }

    // 대여 가능 여부 단순 확인
    public AvailabilityResponseDto checkItemAvailability(Long itemId, LocalDate startDate, LocalDate endDate) {
        boolean existsConflict = rentalRepository.existsConflictingRental(itemId, startDate, endDate);
        return new AvailabilityResponseDto(!existsConflict, Collections.emptyList());
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

    // 특정 유저가 대여한 장비 목록 조회
    @Transactional(readOnly = true)
    public List<Item> getItemsRentedByUser(Long userId) {
        return rentalRepository.findByUserId(userId).stream()
                .map(Rental::getItem)
                .distinct()
                .toList();
    }

    // 파트너 전용: 자기 소속 아이템 대여 요청 조회
    @Transactional(readOnly = true)
    public Page<RentalResponseDto> getPartnerRentalRequests(User actor, RentalStatus status, Pageable pageable) {
        if ("ADMIN".equals(actor.getRole())) {
            // ADMIN은 모든 파트너 요청 조회 가능
            Page<Rental> rentals = rentalRepository.findAllByStatus(
                    status != null ? status : RentalStatus.REQUESTED,
                    pageable
            );
            return rentals.map(RentalResponseDto::from);
        }

        if (!"PARTNER".equals(actor.getRole())) {
            throw new AccessDeniedException("파트너 권한이 필요합니다.");
        }

        Page<Rental> rentals = rentalRepository.findByItemPartnerIdAndStatus(
                actor.getId(),
                status != null ? status : RentalStatus.REQUESTED,
                pageable
        );

        return rentals.map(RentalResponseDto::from);
    }

    // 파트너 전용: 대여 상세 조회
    @Transactional(readOnly = true)
    public RentalResponseDto getPartnerRentalDetail(Long rentalId, User actor) {
        if (!"PARTNER".equals(actor.getRole()) && !"ADMIN".equals(actor.getRole())) {
            throw new AccessDeniedException("파트너 권한이 필요합니다.");
        }

        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("대여 내역이 존재하지 않습니다."));

        // ADMIN은 모든 대여 접근 가능, PARTNER는 자기 소속 아이템만 접근 가능
        if ("PARTNER".equals(actor.getRole()) &&
                !rental.getItem().getPartner().getId().equals(actor.getId())) {
            throw new AccessDeniedException("본인 소속 장비 대여 내역만 조회할 수 있습니다.");
        }

        return RentalResponseDto.from(rental);
    }

    // 파트너 및 관리자 전용: 상태별 대여 내역 전체 조회
    public Page<RentalResponseDto> getAllPartnerRentals(User loginUser, RentalStatus status, Pageable pageable) {
        if ("ADMIN".equals(loginUser.getRole())) {
            Page<Rental> rentals = (status != null)
                    ? rentalRepository.findAllByStatus(status, pageable)
                    : rentalRepository.findAll(pageable); // ✅ null이면 전체 조회로 처리
            return rentals.map(RentalResponseDto::from);

        } else if ("PARTNER".equals(loginUser.getRole())) {
            return rentalRepository.findByPartnerItemAndStatus(loginUser.getId(), status, pageable)
                    .map(RentalResponseDto::from);
        } else {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }
    }

    // === 내부 유틸 ===
    private ActionActor getActorType(User actor) {
        if ("ADMIN".equals(actor.getRole())) return ActionActor.ADMIN;
        if ("PARTNER".equals(actor.getRole())) return ActionActor.PARTNER;
        if ("USER".equals(actor.getRole())) return ActionActor.USER;
        throw new AccessDeniedException("권한이 없습니다.");
    }
}
