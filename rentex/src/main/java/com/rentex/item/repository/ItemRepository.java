package com.rentex.item.repository;

import com.rentex.item.domain.Item;
import com.rentex.item.dto.ItemResponseDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ⚠️ 임시용 ItemRepository
 * RentalService에서 장비 조회(findById)만을 위해 사용되며,
 * 추후 B 역할 담당자(장비/파트너 담당)가 정식 구현 시 삭제 또는 교체
 *
 * TODO: 이후 팀원이 공식 ItemRepository 생성 시 이 파일 삭제할 것
 */
@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    // 기본 CRUD 제공 (findById, save, deleteById 등)

    // 필요 시 추가 예시
    // List<Item> findByStatus(ItemStatus status);
    // List<Item> findByPartnerId(Long partnerId);
    @Query(value = "SELECT * FROM item WHERE partner_id = :partnerId", nativeQuery = true)
    List<Item> findItemsByPartnerIdNative(@Param("partnerId") Long partnerId);

    // 등록 장비 수
    Long countByPartnerId(Long partnerId);

    long countByStatus(Item.ItemStatus status);       // AVAILABLE 개수

}
