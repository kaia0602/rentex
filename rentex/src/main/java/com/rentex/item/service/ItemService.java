package com.rentex.item.service;

import com.rentex.category.domain.Category;
import com.rentex.category.domain.SubCategory;
import com.rentex.category.repository.CategoryRepository;
import com.rentex.category.repository.SubCategoryRepository;
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

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final PartnerRepository partnerRepository;
    private final FileUploadService fileUploadService;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    public List<ItemResponseDTO> getAllItems() {
        return itemRepository.findAll().stream()
                .map(ItemResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ItemResponseDTO> getItemsByPartnerId(Long partnerId) {
        List<Item> items = itemRepository.findItemsByPartnerIdNative(partnerId);
        return items.stream()
                .map(ItemResponseDTO::fromEntity) // Entity → DTO 변환
                .collect(Collectors.toList());
    }

    public void registerItem(ItemRequestDTO dto, MultipartFile thumbnail) {
        Partner partner = partnerRepository.findById(dto.getPartnerId())
                .orElseThrow(() -> new IllegalArgumentException("파트너 ID가 유효하지 않습니다."));

        // 카테고리 존재 확인
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid category ID"));

        // 서브카테고리 존재 확인 및 대분류 카테고리와 맞는지 확인
        SubCategory subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid subCategory ID"));


        if (!subCategory.getCategory().getId().equals(category.getId())) {
            throw new IllegalArgumentException("SubCategory does not belong to Category");
        }

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
                .category(category)
                .subCategory(subCategory)
                .build();

        itemRepository.save(item);
    }

    @Transactional
    public void updateItem(Long id, ItemRequestDTO dto, MultipartFile thumbnail) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이템입니다. id=" + id));

        // Partner도 dto에 있는 partnerId로 변경 필요하면 처리
        Partner partner = partnerRepository.findById(dto.getPartnerId())
                .orElseThrow(() -> new IllegalArgumentException("파트너 ID가 유효하지 않습니다."));

        // 카테고리(대분류, 소분류) 조회 및 설정
        if(dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("대분류 카테고리가 유효하지 않습니다."));
            item.setCategory(category);
        }

        if(dto.getSubCategoryId() != null) {
            SubCategory subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("소분류 카테고리가 유효하지 않습니다."));
            item.setSubCategory(subCategory);
        }


        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setStockQuantity(dto.getStockQuantity());
        item.setDailyPrice(dto.getDailyPrice());
        item.setStatus(ItemStatus.valueOf(dto.getStatus()));
        item.setPartner(partner);

        // 썸네일 이미지 업데이트
        if (thumbnail != null && !thumbnail.isEmpty()) {
            String uploadDir = System.getProperty("user.home") +  File.separator + "uploads";
//            String uploadDir = "C:/rentex/uploads"; // 저장할 경로
            String fileName = System.currentTimeMillis() + "_" + thumbnail.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);

            try {
                Files.createDirectories(filePath.getParent());
                thumbnail.transferTo(filePath.toFile());

                // DB 저장용 URL 또는 경로 갱신
                String fileUrl = "/uploads/" + fileName;
                item.setThumbnailUrl(fileUrl);


                // 기존 이미지 삭제

            } catch (IOException e) {
                throw new RuntimeException("썸네일 업로드 실패", e);
            }
        }

        // 썸네일 수정은 별도 API나 로직 필요할 수 있음. 여기서는 dto에 이미지 없으면 변경 안 함 처리 가능
        // 필요하면 파일 업로드 처리 로직 추가
        // 예) if(dto.getThumbnail() != null) { ... }

        itemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public ItemResponseDTO getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이템입니다. id=" + id));
        return ItemResponseDTO.fromEntity(item);
    }

    @Transactional
    public void deleteItem(Long id) {
        // 존재하는지 확인 후 삭제
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이템입니다. id=" + id));
        itemRepository.delete(item);
    }


}
