package com.rentex.partner.controller;

import com.rentex.partner.domain.Partner;
import com.rentex.partner.dto.PartnerRequestDto;
import com.rentex.partner.dto.PartnerResponseDto;
import com.rentex.partner.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners")
@RequiredArgsConstructor
public class PartnerController {

    private final PartnerService partnerService;

    @PostMapping
    public ResponseEntity<PartnerResponseDto> create(@RequestBody PartnerRequestDto dto) {
        Partner partner = partnerService.toEntity(dto);
        Partner saved = partnerService.createPartner(partner);
        return ResponseEntity.ok(partnerService.toDto(saved));
    }

    @GetMapping
    public ResponseEntity<List<Partner>> getAll() {
        return ResponseEntity.ok(partnerService.findAllPartners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partner> getById(@PathVariable Long id) {
        return ResponseEntity.ok(partnerService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        partnerService.deletePartner(id);
        return ResponseEntity.noContent().build();
    }
}
