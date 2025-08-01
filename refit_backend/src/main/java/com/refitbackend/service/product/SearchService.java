package com.refitbackend.service.product;

import com.refitbackend.dto.product.ProductImageDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SearchService {
    
    /**
     * 통합 검색 - 상품명, 브랜드명, 설명, 카테고리에서 키워드 검색
     */
    List<ProductImageDTO> searchProducts(String keyword, Pageable pageable);
    
    /**
     * 키워드 분리 검색 - 여러 키워드로 검색
     */
    List<ProductImageDTO> searchProductsWithKeywords(List<String> keywords, Pageable pageable);
    
    /**
     * 브랜드별 검색
     */
    List<ProductImageDTO> searchByBrand(String brandName, Pageable pageable);
    
    /**
     * 카테고리별 검색
     */
    List<ProductImageDTO> searchByCategory(String categoryName, Pageable pageable);
    
    /**
     * 검색 결과 개수 반환
     */
    long getSearchResultCount(String keyword);
    
    /**
     * 키워드 분리 검색 결과 개수 반환
     */
    long getSearchResultCountWithKeywords(List<String> keywords);
} 