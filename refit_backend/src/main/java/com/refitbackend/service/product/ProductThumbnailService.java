package com.refitbackend.service.product;

import java.util.List;

import com.refitbackend.dto.product.ProductThumbnailDTO;

/**
 * 상품 썸네일 전용 서비스 인터페이스
 * 목록 페이지에서 사용할 썸네일 관련 기능 제공
 */
public interface ProductThumbnailService {
    
    /**
     * 상품의 모든 썸네일 조회
     */
    List<ProductThumbnailDTO> getThumbnailsByProductId(Long productId);
    
    /**
     * 상품의 대표 썸네일 하나만 조회
     */
    ProductThumbnailDTO getMainThumbnailByProductId(Long productId);
    
    /**
     * 여러 상품의 대표 썸네일 조회 (목록 페이지용)
     */
    List<ProductThumbnailDTO> getMainThumbnailsByProductIds(List<Long> productIds);
} 