package com.rentex.item.repository;

import com.rentex.item.domain.Item;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * ⚠️ 임시용 ItemRepository
 * RentalService에서 장비 조회(findById)만을 위해 사용되며,
 * 추후 B 역할 담당자(장비/파트너 담당)가 정식 구현 시 삭제 또는 교체
 *
 * TODO: 이후 팀원이 공식 ItemRepository 생성 시 이 파일 삭제할 것
 */
public interface ItemRepository extends JpaRepository<Item, Long> {
}
