package com.refitbackend.domain.order;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.refitbackend.domain.member.Member;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Member member;

    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    private OrderStatus status; // ORDERED, SHIPPED, DELIVERED, CANCELED 등

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    // 적립금 관련 필드 추가
    private int totalAmount; // 총 주문 금액
    private int usedCredit; // 사용한 적립금
    private int finalAmount; // 최종 결제 금액
    private int earnedCredit; // 적립된 적립금 (최종 결제 금액의 8%)

}
