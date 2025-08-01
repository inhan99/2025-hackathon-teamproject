package com.refitbackend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductOptionDTO {
    private Long id;
    private String size;
    private String color;
    private Integer stock;
    private Integer priceAdjustment;
}
