package com.rentex.category.controller;

import com.rentex.category.domain.Category;
import com.rentex.category.domain.SubCategory;
import com.rentex.category.dto.SubCategoryDTO;
import com.rentex.category.dto.SubCategoryRevenueDTO;
import com.rentex.category.repository.CategoryRepository;
import com.rentex.category.repository.SubCategoryRepository;
import com.rentex.rental.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final RentalRepository rentalRepository;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/{categoryId}/subcategories")
    public List<SubCategoryDTO> getSubcategories(@PathVariable Long categoryId) {
        List<SubCategory> subs = subCategoryRepository.findByCategoryId(categoryId);
        return subs.stream()
                .map(SubCategoryDTO::new)
                .collect(Collectors.toList());
    }


    @GetMapping("/subcategories/revenue")
    public List<SubCategoryRevenueDTO> getSubCategoryRevenue() {
        return rentalRepository.findTopSubCategoryRevenue();
    }

}