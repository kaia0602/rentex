package com.rentex.item.service;

import com.rentex.common.upload.FileUploadService;
import com.rentex.item.domain.Item;
import com.rentex.item.domain.Item.ItemStatus;
import com.rentex.item.dto.ItemRequestDTO;
import com.rentex.item.dto.ItemResponseDTO;
import com.rentex.partner.domain.Partner;
import com.rentex.partner.repository.PartnerRepository;
import com.rentex.item.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final PartnerRepository partnerRepository;
    private final FileUploadService fileUploadService;

    public List<ItemResponseDTO> getAllItems() {
        return itemRepository.findAll().stream()
                .map(ItemResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

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
                .dailyPrice(dto.getDailyPrice())
                .build();

        itemRepository.save(item);
    }

    @Transactional
    public void updateItem(Long id, ItemRequestDTO dto) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이템입니다. id=" + id));

        // Partner도 dto에 있는 partnerId로 변경 필요하면 처리
        Partner partner = partnerRepository.findById(dto.getPartnerId())
                .orElseThrow(() -> new IllegalArgumentException("파트너 ID가 유효하지 않습니다."));

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setStockQuantity(dto.getStockQuantity());
        item.setDailyPrice(dto.getDailyPrice());
        item.setStatus(ItemStatus.valueOf(dto.getStatus()));
        item.setPartner(partner);

        // 썸네일 수정은 별도 API나 로직 필요할 수 있음. 여기서는 dto에 이미지 없으면 변경 안 함 처리 가능
        // 필요하면 파일 업로드 처리 로직 추가
        // 예) if(dto.getThumbnail() != null) { ... }

        itemRepository.save(item);
    }

    @Transactional
    public void deleteItem(Long id) {
        // 존재하는지 확인 후 삭제
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이템입니다. id=" + id));
        itemRepository.delete(item);
    }
}
