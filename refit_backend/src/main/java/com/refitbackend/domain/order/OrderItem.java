package com.refitbackend.domain.order;

import com.refitbackend.domain.product.Product;
import com.refitbackend.domain.product.ProductOption;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    private ProductOption option; // 옵션도 선택할 수 있다면

    private int quantity;
    private int price; // 주문 당시 가격 (Product 가격 복사)
}