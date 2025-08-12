//package com.rentex.rental.service;
//
//import com.rentex.item.domain.Item;
//import com.rentex.item.repository.ItemRepository;
//import com.rentex.partner.domain.Partner;
//import com.rentex.partner.repository.PartnerRepository;
//import com.rentex.rental.domain.Rental;
//import com.rentex.rental.domain.RentalStatus;
//import com.rentex.rental.dto.RentalRequestDto;
//import com.rentex.rental.repository.RentalHistoryRepository;
//import com.rentex.rental.repository.RentalRepository;
//import com.rentex.user.domain.User;
//import com.rentex.user.domain.Role;
//import com.rentex.user.repository.UserRepository;
//import jakarta.transaction.Transactional;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//
//import java.time.LocalDate;
//import java.util.List;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//@SpringBootTest
//@Transactional
//class RentalServiceTest {
//
//    @Autowired
//    RentalService rentalService;
//
//    @Autowired
//    RentalRepository rentalRepository;
//
//    @Autowired
//    RentalHistoryRepository rentalHistoryRepository;
//
//    @Autowired
//    ItemRepository itemRepository;
//
//    @Autowired
//    UserRepository userRepository;
//
//    @Autowired
//    PartnerRepository partnerRepository;
//
//    User user;
//    Item item;
//    Partner partner;
//
//    @BeforeEach
//    void setUp() {
//        // 1. 파트너 저장
//        partner = partnerRepository.save(Partner.builder()
//                .name("테스트 파트너")
//                .businessNo("123-" + UUID.randomUUID().toString().substring(0, 10))
//                .contactEmail("partner@test.com")
//                .contactPhone("010-1234-5678")
//                .build());
//
//        // 2. 유저 저장
//        user = userRepository.save(User.builder()
//                .email("test@rentex.com")
//                .password("1234")
//                .name("테스트 유저")
//                .nickname("tester")
//                .role(Role.USER)
//                .build());
//
//        // 3. 아이템 저장 (필수 필드 포함)
//        item = itemRepository.save(Item.builder()
//                .name("테스트 장비")
//                .stockQuantity(5)
//                .status(Item.ItemStatus.AVAILABLE) // 상태 지정
//                .dailyPrice(10000)                 // 가격 지정
//                .partner(partner)                  // 파트너 연결
//                .build());
//    }
//
//
//    @Test
//    void requestRental_success() {
//        RentalRequestDto dto = new RentalRequestDto(
//                item.getId(),
//                1,
//                LocalDate.now(),
//                LocalDate.now().plusDays(2)
//        );
//
//        rentalService.requestRental(dto, user);
//
//        List<Rental> rentals = rentalRepository.findByUserId(user.getId());
//        assertEquals(1, rentals.size());
//        assertEquals(RentalStatus.REQUESTED, rentals.get(0).getStatus());
//    }
//}
