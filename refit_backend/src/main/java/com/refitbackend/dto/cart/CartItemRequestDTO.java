package com.refitbackend.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequestDTO {
    private Long productId;
    private int quantity;
    private Long cartItemId;
    private Long optionId;  // 옵션 ID 추가
}
