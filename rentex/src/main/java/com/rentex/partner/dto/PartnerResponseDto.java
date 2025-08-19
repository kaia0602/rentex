//package com.rentex.partner.dto;
//
//import com.rentex.partner.domain.Partner;
//import lombok.*;
//
//import java.time.LocalDateTime;
//
//@Getter
//@Builder
//@AllArgsConstructor
//@NoArgsConstructor
//@Setter
//public class PartnerResponseDto {
//    private Long id;
//    private String name;
//    private String businessNo;
//    private String contactEmail;
//    private String contactPhone;
//    private LocalDateTime createdAt;
//    private LocalDateTime updatedAt;
//
//    public static PartnerResponseDto from(Partner partner) {
//        return PartnerResponseDto.builder()
//                .id(partner.getId())
//                .name(partner.getName())
//                .businessNo(partner.getBusinessNo())
//                .contactEmail(partner.getContactEmail())
//                .contactPhone(partner.getContactPhone())
//                .build();
//    }
//}
