package com.refitbackend.dto.review;

import com.refitbackend.domain.review.Review;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDTO {
    private Long id;
    private String content;
    private Double rating;
    private String memberEmail;
    private Long productId;
    private String productName;
    private Long orderId; // 주문 ID 추가
    private String optionName; // 구매한 옵션 이름
    private String imageUrl; // 리뷰 이미지 URL
    private Integer weight;
    private Integer height;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer earnedPoints; // 리뷰 작성으로 획득한 적립금


    // 엔티티 -> DTO 변환
    public static ReviewResponseDTO fromEntity(Review entity) {
        return ReviewResponseDTO.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .rating(entity.getRating())
                .memberEmail(entity.getMember().getEmail())
                .productId(entity.getProduct().getId())
                .productName(entity.getProduct().getName())
                .orderId(entity.getOrderId())
                .optionName(entity.getOptionName())
                .imageUrl(entity.getImageUrl())
                .weight(entity.getWeight())
                .height(entity.getHeight())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .earnedPoints(0) // 기본값 0으로 설정
                .build();
    }
} 