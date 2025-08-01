package com.refitbackend.repository.product;

import org.springframework.data.jpa.repository.JpaRepository;

import com.refitbackend.domain.product.Brand;

public interface BrandRepository extends JpaRepository<Brand, Long> {
}
