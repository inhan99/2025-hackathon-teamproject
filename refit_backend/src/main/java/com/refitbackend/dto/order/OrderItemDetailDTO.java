package com.refitbackend.dto.order;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDetailDTO {
    private String urlThumbnail;
    private Long productId;
    private String productName;
    private String optionName;
    private int quantity;
    private int price; // 주문 당시 가격
    private Long orderId; // 주문 ID 추가
    private LocalDateTime createdAt;

    // JPQL에서 사용하는 생성자
    public OrderItemDetailDTO(
    String productName,
    String optionName,
    int quantity,
    int price,
    Long productId,
    Long orderId,
    LocalDateTime createdAt,
    String urlThumbnail
) {
    this.productName = productName;
    this.optionName = optionName;
    this.quantity = quantity;
    this.price = price;
    this.productId = productId;
    this.orderId = orderId;
    this.createdAt = createdAt;
    this.urlThumbnail = urlThumbnail;
}

}
