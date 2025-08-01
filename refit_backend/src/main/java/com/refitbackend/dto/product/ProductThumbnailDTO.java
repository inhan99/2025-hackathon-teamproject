package com.refitbackend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 상품 목록에서 사용할 썸네일 전용 DTO
 * 목록 페이지에서 필요한 최소한의 정보만 포함
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductThumbnailDTO {
    private Long id;
    private String urlThumbnail;  // 썸네일 이미지 URL
    private String altText;       // 이미지 대체 텍스트
    private Integer imageOrder;   // 이미지 순서
    private Long productId;       // 상품 ID

    
} 