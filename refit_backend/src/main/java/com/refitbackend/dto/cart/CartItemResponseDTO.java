package com.refitbackend.dto.cart;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class CartItemResponseDTO {

  private Long cartItemId;    // cino → cartItemId

  private int quantity;       // qty → quantity

  private Long productId;     // pno → productId

  private String productName; // pname → productName

  private int price;

  private String imageUrl;    // imageFile → imageUrl

  private Long optionId;      // 옵션 ID 추가

  private String optionSize;  // 옵션 사이즈 등 추가 가능

  // 기존 생성자 유지
  public CartItemResponseDTO(Long cartItemId, int quantity, Long productId,
                             String productName, int price, String imageUrl) {
    this.cartItemId = cartItemId;
    this.quantity = quantity;
    this.productId = productId;
    this.productName = productName;
    this.price = price;
    this.imageUrl = imageUrl;
  }

  // 옵션 필드 포함한 새 생성자 추가
  public CartItemResponseDTO(Long cartItemId, int quantity, Long productId,
                             String productName, int price, String imageUrl,
                             Long optionId, String optionSize) {
    this.cartItemId = cartItemId;
    this.quantity = quantity;
    this.productId = productId;
    this.productName = productName;
    this.price = price;
    this.imageUrl = imageUrl;
    this.optionId = optionId;
    this.optionSize = optionSize;
  }
}
