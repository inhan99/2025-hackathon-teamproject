package com.refitbackend.dto.product;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProductDetailDTO {

    private Long id;
    private String name;
    private String description;
    private Integer basePrice;
    private String status; // 문자열로 처리 (ProductStatus enum 대신)
    
    private Long categoryId;
    private String categoryName;

    private Long brandId;
    private String brandName; 

    private Double rating;

    private List<ProductOptionDTO> options;
    private List<ProductImageDTO> images;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}