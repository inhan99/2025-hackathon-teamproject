package com.refitbackend.dto.review;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReviewRequestDTO {
    private String content;
    private Double rating; // 1.0 ~ 5.0
    private Long productId;
    private Long orderId; // 주문 ID 추가
    private String optionName; // 구매한 옵션 이름
    private String imageUrl; // 리뷰 이미지 URL
    private Integer weight;
    private Integer height;
} 