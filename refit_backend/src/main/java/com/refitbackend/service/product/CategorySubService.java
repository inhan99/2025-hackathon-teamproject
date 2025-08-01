package com.refitbackend.service.product;

import com.refitbackend.dto.product.CategorySubDTO;
import java.util.List;

public interface CategorySubService {
    List<CategorySubDTO> getAllCategorySubs();
    List<CategorySubDTO> getSubCategoriesByMainCategoryId(Long mainCategoryId);
} 