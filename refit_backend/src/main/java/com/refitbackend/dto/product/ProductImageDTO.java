package com.refitbackend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductImageDTO {
    private Long id;
    private String url;           
    private String urlThumbnail;
    private String altText;
    private Boolean isThumbnail;
    private Integer imageOrder;
    private Long productId;
    
    // 상품 기본 정보 추가
    private String productName;
    private Double productRating;
    private Integer productBasePrice;

    // 2차 추가
    private String brandName;
    private Integer reviewCount;

    public ProductImageDTO(Long id, String url, String urlThumbnail, String altText, Boolean isThumbnail, Integer imageOrder,
                       Long productId, String productName, Double productRating, Integer productBasePrice,
                       String brandName, Long reviewCount) {
    this.id = id;
    this.url = url;
    this.urlThumbnail = urlThumbnail;
    this.altText = altText;
    this.isThumbnail = isThumbnail;
    this.imageOrder = imageOrder;
    this.productId = productId;
    this.productName = productName;
    this.productRating = productRating;
    this.productBasePrice = productBasePrice;
    this.brandName = brandName;
    this.reviewCount = reviewCount.intValue(); // Integer 변환
}
}