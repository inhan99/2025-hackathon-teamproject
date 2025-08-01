package com.refitbackend.dto.order;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    private Long productId;
    private Long optionId; // 옵션을 고르는 구조라면
    private int quantity;
}

