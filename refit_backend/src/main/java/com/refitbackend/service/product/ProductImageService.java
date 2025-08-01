package com.refitbackend.service.product;

import java.util.List;
import java.util.Map;

import com.refitbackend.dto.product.ProductImageDTO;

public interface ProductImageService {
    List<ProductImageDTO> getByProductId(Long productId);
    
    /**
     * 여러 상품의 이미지를 한 번에 조회 (N+1 문제 해결)
     * @param productIds 상품 ID 목록
     * @return 상품 ID를 키로 하는 이미지 목록 맵
     */
    Map<Long, List<ProductImageDTO>> getByProductIds(List<Long> productIds);
    
} 
