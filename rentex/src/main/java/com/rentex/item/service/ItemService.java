package com.rentex.item.service;

import com.rentex.common.upload.FileUploadService;
import com.rentex.item.domain.Item;
import com.rentex.item.domain.Item.ItemStatus;
import com.rentex.item.dto.ItemRequestDTO;
import com.rentex.partner.domain.Partner;
import com.rentex.partner.repository.PartnerRepository;
import com.rentex.item.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final PartnerRepository partnerRepository;
    private final FileUploadService fileUploadService;

    public void registerItem(ItemRequestDTO dto, MultipartFile thumbnail) {
        Partner partner = partnerRepository.findById(dto.getPartnerId())
                .orElseThrow(() -> new IllegalArgumentException("파트너 ID가 유효하지 않습니다."));

        String thumbnailUrl = null;
        if (thumbnail != null && !thumbnail.isEmpty()) {
            thumbnailUrl = fileUploadService.upload(thumbnail); // S3 or 로컬 처리
        }

        Item item = Item.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .stockQuantity(dto.getStockQuantity())
                .status(ItemStatus.valueOf(dto.getStatus()))
                .partner(partner)
                .thumbnailUrl(thumbnailUrl)
                .build();

        itemRepository.save(item);
    }
}
