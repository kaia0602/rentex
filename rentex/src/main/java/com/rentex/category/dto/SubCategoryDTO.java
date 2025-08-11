package com.rentex.category.dto;

import com.rentex.category.domain.SubCategory;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubCategoryDTO {
    private Long id;
    private String name;
    private Long categoryId;
    private String categoryName;

    public SubCategoryDTO(SubCategory subCategory) {
        this.id = subCategory.getId();
        this.name = subCategory.getName();
        this.categoryId = subCategory.getCategory().getId();
        this.categoryName = subCategory.getCategory().getName();
    }
}
