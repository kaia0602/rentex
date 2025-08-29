package com.rentex.favorite.service;

import com.rentex.favorite.domain.Favorite;
import com.rentex.favorite.repository.FavoriteRepository;
import com.rentex.item.domain.Item;
import com.rentex.item.dto.ItemResponseDTO;
import com.rentex.item.repository.ItemRepository;
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    /** 찜 토글: 등록되면 true, 해제되면 false 반환 */
    @Transactional
    public boolean toggleFavorite(Long itemId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Item item = itemRepository.findById(itemId).orElseThrow();

        if (favoriteRepository.existsByUserAndItem(user, item)) {
            favoriteRepository.deleteByUserAndItem(user, item);
            return false;
        } else {
            favoriteRepository.save(Favorite.builder().user(user).item(item).build());
            return true;
        }
    }

    /** 해당 아이템 찜 여부 체크 */
    @Transactional(readOnly = true)
    public boolean isFavorite(Long itemId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Item item = itemRepository.findById(itemId).orElseThrow();
        return favoriteRepository.existsByUserAndItem(user, item);
    }

    /** 내 찜 목록 (ItemResponseDTO로 통일) */
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getMyFavorites(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return favoriteRepository.findByUser(user).stream()
                .map(f -> ItemResponseDTO.fromEntity(f.getItem()))
                .toList();
    }
}
