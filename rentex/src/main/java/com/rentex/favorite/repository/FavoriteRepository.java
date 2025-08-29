package com.rentex.favorite.repository;

import com.rentex.favorite.domain.Favorite;
import com.rentex.item.domain.Item;
import com.rentex.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByUserAndItem(User user, Item item);
    void deleteByUserAndItem(User user, Item item);
    List<Favorite> findByUser(User user);

    @Query("""
        select f.item.id, count(f) 
        from Favorite f 
        group by f.item.id 
        order by count(f) desc
    """)
    List<Object[]> findTopFavoritedItems(); // 대시보드용
}
