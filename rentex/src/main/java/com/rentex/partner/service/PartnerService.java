//package com.rentex.partner.service;
//
//import com.rentex.partner.domain.Partner;
//import com.rentex.partner.dto.PartnerRequestDto;
//import com.rentex.partner.dto.PartnerResponseDto;
//import com.rentex.partner.repository.PartnerRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class PartnerService {
//
//    private final PartnerRepository partnerRepository;
//
//    public Partner createPartner(Partner partner) {
//        return partnerRepository.save(partner);
//    }
//
//    public List<Partner> findAllPartners() {
//        return partnerRepository.findAll();
//    }
//
//    public Partner findById(Long id) {
//        return partnerRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException("파트너를 찾을 수 없습니다."));
//    }
//
//    public void deletePartner(Long id) {
//        partnerRepository.deleteById(id);
//    }
//
//    public Partner toEntity(PartnerRequestDto dto) {
//        return Partner.builder()
//                .name(dto.getName())
//                .businessNo(dto.getBusinessNo())
//                .contactEmail(dto.getContactEmail())
//                .contactPhone(dto.getContactPhone())
//                .build();
//    }
//
//    public PartnerResponseDto toDto(Partner partner) {
//        return PartnerResponseDto.builder()
//                .id(partner.getId())
//                .name(partner.getName())
//                .businessNo(partner.getBusinessNo())
//                .contactEmail(partner.getContactEmail())
//                .contactPhone(partner.getContactPhone())
//                .createdAt(partner.getCreatedAt())
//                .updatedAt(partner.getUpdatedAt())
//                .build();
//    }
//}
//
