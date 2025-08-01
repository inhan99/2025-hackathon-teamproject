package com.refitbackend.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySubDTO {
    private Long id;
    private String name;
    private Long categoryId;
    private String categoryName;
} 