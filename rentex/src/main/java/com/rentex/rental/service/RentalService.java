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
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.rentex.payment.domain.Payment;
import com.rentex.payment.domain.Payment.PaymentMethod;
import com.rentex.payment.domain.PaymentType;
import com.rentex.payment.repository.PaymentRepository;
import java.time.LocalDateTime;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RentalService {

    private final ItemRepository itemRepository;
    private final RentalRepository rentalRepository;
    private final RentalHistoryRepository rentalHistoryRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    // === 공통: actor 영속화 ===
    private User getManagedActor(User actor) {
        return userRepository.findById(actor.getId())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
    }
    // === 내부 유틸 ===
    private ActionActor getActorType(User actor) {
        if ("ADMIN".equals(actor.getRole())) return ActionActor.ADMIN;
        if ("PARTNER".equals(actor.getRole())) return ActionActor.PARTNER;
        if ("USER".equals(actor.getRole())) return ActionActor.USER;
        throw new AccessDeniedException("권한이 없습니다.");
    }

    // --- 권한 헬퍼 (클래스 하단 getActorType() 위/아래 어느 곳이든) ---
    private boolean isAdmin(User u)   { return "ADMIN".equals(u.getRole()); }
    private boolean isPartner(User u) { return "PARTNER".equals(u.getRole()); }
    private boolean isUser(User u)    { return "USER".equals(u.getRole()); }

    // 본인 대여건만 허용 (또는 ADMIN)
    private void requireOwnerUserOrAdmin(Rental r, User actor) {
        if (isAdmin(actor)) return;
        if (!r.getUser().getId().equals(actor.getId())) {
            throw new AccessDeniedException("본인 대여건만 수행할 수 있습니다.");
        }
    }

    // 아이템 소유 파트너만 허용 (또는 ADMIN)
    //  - Item.partner 는 User 이므로 actor.getId() 와 비교
    private void requireOwnerPartnerOrAdmin(Rental r, User actor) {
        if (isAdmin(actor)) return;
        if (!isPartner(actor)) throw new AccessDeniedException("파트너 권한이 필요합니다.");
        Long ownerId = r.getItem().getPartner().getId();
        if (!ownerId.equals(actor.getId())) {
            throw new AccessDeniedException("해당 파트너 소속 장비에만 수행할 수 있습니다.");
        }
    }

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
    public Rental requestRental(RentalRequestDto requestDto, User actor) {
        // 권한 부여
        if (!(isUser(actor) || isAdmin(actor))) {
            throw new AccessDeniedException("사용자 또는 관리자만 대여 요청이 가능합니다.");
        }
        // 벌점 차단
        if (actor.getPenaltyPoints() >= 3) {
            throw new PenaltyBlockedException();
        }

        Item item = itemRepository.findById(requestDto.itemId())
                .orElseThrow(() -> new ItemNotFoundException("해당 장비가 존재하지 않습니다."));

        if (item.getStockQuantity() < requestDto.quantity()) {
            throw new ItemUnavailableException("재고가 부족합니다.");
        }

        boolean isOverlapping = rentalRepository.existsByItemAndStatusIn(
                item,
                List.of(RentalStatus.REQUESTED, RentalStatus.APPROVED, RentalStatus.SHIPPED, RentalStatus.RECEIVED)
        );
        if (isOverlapping) {
            throw new ItemUnavailableException("이미 대여 중이거나 승인 대기 중인 장비입니다.");
        }

        Rental rental = Rental.builder()
                .user(getManagedActor(actor))
                .item(item)
                .quantity(requestDto.quantity())
                .startDate(requestDto.startDate())
                .endDate(requestDto.endDate())
                .status(RentalStatus.REQUESTED)
                .build();
        rentalRepository.save(rental);

        User managedActor = getManagedActor(actor);
        rentalHistoryRepository.save(RentalHistory.of(
                rental, null, RentalStatus.REQUESTED, getActorType(managedActor), "대여 요청함", managedActor
        ));
        return rental;
    }

    // 결제 처리 메서드 (수정본)
    @Transactional
    public Payment payForRental(Long rentalId, PaymentMethod method, User user, int amount) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("대여 내역이 존재하지 않습니다. id=" + rentalId));

        requireOwnerUserOrAdmin(rental, user);
        // (선택) 본인/권한 확인, 금액 재검증
        // int serverAmount = calculateAmount(rental);
        // if (serverAmount != amount) throw new BadRequestException("결제 금액 불일치");

        User managedActor = getManagedActor(user);

        Payment payment = Payment.builder()
                .type(PaymentType.RENTAL)
                .method(method)
                .amount(amount)
                .user(managedActor)
                .rental(rental)                 // 대여 결제이므로 연결
                .paidAt(LocalDateTime.now())
                .status(Payment.PaymentStatus.SUCCESS)
                .build();

        paymentRepository.save(payment);

        // 히스토리: 결제는 상태 변화 없음(REQUESTED 유지)
        rentalHistoryRepository.save(
                RentalHistory.of(
                        rental,
                        rental.getStatus(),            // from: 기존 상태
                        rental.getStatus(),            // to  : 동일 상태
                        getActorType(managedActor),
                        "대여 결제 완료",
                        managedActor
                )
        );

        return payment;
    }

    // 요청 + 결제 (수정 포인트는 동일: 자동 승인 없음)
    @Transactional
    public RentalPayResponseDto requestAndPay(RentalRequestAndPayDto dto, User actor) {
        // 1) 대여 요청 생성 → 항상 REQUESTED
        RentalRequestDto reqDto = new RentalRequestDto(
                dto.itemId(), dto.quantity(), dto.startDate(), dto.endDate()
        );
        Rental rental = requestRental(reqDto, actor);

        // 2) 서버 금액 재검증
        int serverAmount = calculateAmount(rental);
        if (serverAmount != dto.amount()) {
            throw new IllegalArgumentException("결제 금액 불일치");
        }

        // 3) 결제 처리 (상태 변화 없음)
        Payment payment = payForRental(rental.getId(), dto.method(), actor, dto.amount());

        // 반환 시 상태는 REQUESTED 그대로
        return new RentalPayResponseDto(rental.getId(), payment.getId(), rental.getStatus());
    }


    // 금액 계산 유틸
    private int calculateAmount(Rental rental) {
        int days = (int) java.time.Duration.between(
                rental.getStartDate().atStartOfDay(),
                rental.getEndDate().plusDays(1).atStartOfDay()
        ).toDays();
        days = Math.max(1, days);
        return rental.getItem().getDailyPrice() * rental.getQuantity() * days;
    }

    // 취소 (USER, ADMIN)
    public void cancelRental(Long rentalId, User actor, String reason) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("대여 요청 없음"));

        if (rental.getStatus() != RentalStatus.REQUESTED) {
            throw new InvalidRentalStateException("요청 단계에서만 취소할 수 있습니다.");
        }
        if (!rental.getUser().getId().equals(actor.getId()) && !"ADMIN".equals(actor.getRole())) {
            throw new AccessDeniedException("본인 요청만 취소할 수 있습니다.");
        }

        RentalStatus from = rental.getStatus();
        rental.changeStatus(RentalStatus.CANCELED);

        User managedActor = getManagedActor(actor);
        rentalHistoryRepository.save(RentalHistory.of(
                rental, from, RentalStatus.CANCELED,
                getActorType(managedActor),
                "대여 요청 취소: " + reason,   // 사유 남기기
                managedActor
        ));
    }

    // 거절 (PARTNER, ADMIN)
    public void rejectRental(Long rentalId, User actor, String reason) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("대여 요청 없음"));

        requireOwnerPartnerOrAdmin(rental, actor) ;

        if (rental.getStatus() != RentalStatus.REQUESTED) {
            throw new InvalidRentalStateException("요청 상태에서만 거절할 수 있습니다.");
        }
        if (!"PARTNER".equals(actor.getRole()) && !"ADMIN".equals(actor.getRole())) {
            throw new AccessDeniedException("파트너/관리자만 거절할 수 있습니다.");
        }

        RentalStatus from = rental.getStatus();
        rental.changeStatus(RentalStatus.REJECTED);

        User managedActor = getManagedActor(actor);
        rentalHistoryRepository.save(RentalHistory.of(
                rental, from, RentalStatus.REJECTED,
                getActorType(managedActor),
                "대여 요청 거절: " + reason,   // 사유 남기기
                managedActor
        ));
    }

    // 대여 요청 승인 (PARTNER 또는 ADMIN)
    public void approveRental(Long rentalId, User actor) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("해당 대여 요청이 존재하지 않습니다."));

        requireOwnerPartnerOrAdmin(rental, actor);

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

        User managedActor = getManagedActor(actor);
        rentalHistoryRepository.save(RentalHistory.of(
                rental,
                from,
                RentalStatus.APPROVED,
                getActorType(managedActor),
                "대여를 승인함",
                managedActor
        ));
    }

    // 장비 배송 처리 (PARTNER 또는 ADMIN)
    public void shipRental(Long rentalId, User actor) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("해당 대여 정보를 찾을 수 없습니다."));

        requireOwnerPartnerOrAdmin(rental, actor);

        if (rental.getStatus() != RentalStatus.APPROVED) {
            throw new InvalidRentalStateException("승인된 상태여야 배송할 수 있습니다.");
        }

        RentalStatus from = rental.getStatus();
        rental.changeStatus(RentalStatus.SHIPPED);

        User managedActor = getManagedActor(actor);
        rentalHistoryRepository.save(
                RentalHistory.of(
                        rental,
                        from,
                        RentalStatus.SHIPPED,
                        getActorType(managedActor),
                        "장비를 배송 처리함",
                        managedActor
                )
        );
    }

    // 장비 수령 확인 (USER 또는 ADMIN)
    public void confirmReceiveRental(Long rentalId, User actor) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("해당 대여 정보를 찾을 수 없습니다."));

        if (rental.getStatus() != RentalStatus.SHIPPED) {
            throw new InvalidRentalStateException("배송 중 상태여야 수령 확인이 가능합니다.");
        }

        if (!rental.getUser().getId().equals(actor.getId())
                && !"ADMIN".equals(actor.getRole())) {
            throw new AccessDeniedException("본인 대여건만 수령 확인 가능합니다.");
        }

        RentalStatus from = rental.getStatus();
        rental.receive(); // ✅ 엔티티 메서드 (status=RECEIVED, rentedAt 기록)

        User managedActor = getManagedActor(actor);
        rentalHistoryRepository.save(
                RentalHistory.of(
                        rental,
                        from,
                        RentalStatus.RECEIVED,
                        getActorType(managedActor),
                        "장비 수령을 확인했습니다.",
                        managedActor
                )
        );
    }

    // 반납 요청 (USER 또는 ADMIN)
    public void requestReturn(Long rentalId, User actor) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("해당 대여가 없습니다."));

        if (rental.getStatus() != RentalStatus.RECEIVED) { // ✅ RENTED → RECEIVED
            throw new InvalidRentalStateException("수령 완료 상태여야 반납 요청이 가능합니다.");
        }

        if (!rental.getUser().getId().equals(actor.getId())
                && !"ADMIN".equals(actor.getRole())) {
            throw new AccessDeniedException("본인 대여건만 반납 요청 가능합니다.");
        }

        RentalStatus from = rental.getStatus();
        rental.changeStatus(RentalStatus.RETURN_REQUESTED);

        User managedActor = getManagedActor(actor);
        rentalHistoryRepository.save(RentalHistory.of(
                rental,
                from,
                RentalStatus.RETURN_REQUESTED,
                getActorType(managedActor),
                "반납을 요청했습니다.",
                managedActor
        ));
    }

    // 반납 확정 처리 (PARTNER 또는 ADMIN)
    public void returnRental(Long rentalId, User actor) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("대여 내역이 존재하지 않습니다."));

        requireOwnerPartnerOrAdmin(rental, actor);

        if (rental.getStatus() != RentalStatus.RETURN_REQUESTED) {
            throw new InvalidRentalStateException("반납 요청 상태가 아닙니다.");
        }

        rental.changeStatus(RentalStatus.RETURNED);
        rental.setReturnedAt(LocalDateTime.now());
        rental.getItem().increaseStock(rental.getQuantity());

        User managedActor = getManagedActor(actor);
        rentalHistoryRepository.save(RentalHistory.of(
                rental,
                RentalStatus.RETURN_REQUESTED,
                RentalStatus.RETURNED,
                getActorType(managedActor),
                "반납을 확인하였습니다.",
                managedActor
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
    @Transactional(readOnly = true)
    public RentalResponseDto getRentalDetail(Long rentalId, User actor) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("대여 내역을 찾을 수 없습니다."));

        if (!rental.getUser().getId().equals(actor.getId())
                && !"ADMIN".equals(actor.getRole())) {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }

        return RentalResponseDto.from(rental);
    }

    // 대여 가능 여부 단순 확인
    public AvailabilityResponseDto checkItemAvailability(Long itemId, LocalDate startDate, LocalDate endDate) {
        boolean existsConflict = rentalRepository.existsConflictingRental(itemId, startDate, endDate);
        return new AvailabilityResponseDto(!existsConflict, Collections.emptyList());
    }

    // 특정 대여의 히스토리 리스트 조회
    public List<RentalHistoryResponseDto> getRentalHistory(Long rentalId, User actor) {
        Rental r = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("대여 내역이 존재하지 않습니다."));
        // 본인 or ADMIN or 소유 파트너
        try { requireOwnerUserOrAdmin(r, actor); }
        catch (AccessDeniedException e) { requireOwnerPartnerOrAdmin(r, actor); }
        return rentalHistoryRepository.findByRentalOrderByCreatedAtAsc(rentalId)
                .stream().map(RentalHistoryResponseDto::from).toList();
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
                    : rentalRepository.findAll(pageable);
            return rentals.map(RentalResponseDto::from);

        } else if ("PARTNER".equals(loginUser.getRole())) {
            return rentalRepository.findByPartnerItemAndStatus(loginUser.getId(), status, pageable)
                    .map(RentalResponseDto::from);
        } else {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }
    }

}
