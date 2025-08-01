package com.refitbackend.service.product;

import com.refitbackend.domain.product.CategorySub;
import com.refitbackend.dto.product.CategorySubDTO;
import com.refitbackend.repository.product.CategorySubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategorySubServiceImpl implements CategorySubService {

    private final CategorySubRepository categorySubRepository;

    @Override
    public List<CategorySubDTO> getAllCategorySubs() {
        List<CategorySub> categorySubs = categorySubRepository.findAll();
        
        return categorySubs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategorySubDTO> getSubCategoriesByMainCategoryId(Long mainCategoryId) {
        List<CategorySub> categorySubs = categorySubRepository.findByCategoryId(mainCategoryId);
        
        return categorySubs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CategorySubDTO convertToDTO(CategorySub categorySub) {
        return CategorySubDTO.builder()
                .id(categorySub.getId())
                .name(categorySub.getName())
                .categoryId(categorySub.getCategory().getId())
                .categoryName(categorySub.getCategory().getName())
                .build();
    }


} 