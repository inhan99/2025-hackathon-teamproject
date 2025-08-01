package com.refitbackend.repository.product;


import org.springframework.data.jpa.repository.JpaRepository;

import com.refitbackend.domain.product.Category;

public interface CategoryRepository extends JpaRepository<Category, Long>{
    
}
