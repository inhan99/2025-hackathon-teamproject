package com.refitbackend.dto.vision;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisionAnalysisResponseDTO {
    private List<VisionLabelDTO> labels;
    private String extractedText;
    private List<VisionProductDTO> relatedProducts;
    private String clothingType;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisionLabelDTO {
        private String description;
        private Double score;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisionProductDTO {
        private Long id;
        private String name;
        private String description;
        private Integer basePrice;
        private String brandName;
        private String categoryName;
        private String categorySubName;
        private Double rating;
        private String mainImageUrl;
        private Double relevanceScore; // 관련성 점수
    }
} 