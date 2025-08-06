package com.rentex.item.repository;

import com.rentex.item.domain.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    // 기본 CRUD 제공 (findById, save, deleteById 등)

    // 필요 시 추가 예시
    // List<Item> findByStatus(ItemStatus status);
    // List<Item> findByPartnerId(Long partnerId);
}
