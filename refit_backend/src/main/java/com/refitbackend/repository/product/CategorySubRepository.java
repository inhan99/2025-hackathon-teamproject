package com.refitbackend.repository.product;

import com.refitbackend.domain.product.CategorySub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategorySubRepository extends JpaRepository<CategorySub, Long> {
    List<CategorySub> findByCategoryId(Long categoryId);
} 