package com.refitbackend.domain.review;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reviews")public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Double rating; // 1.0 ~ 5.0 제한은 setter 또는 service 단에서 체크

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_email", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(name = "order_id", nullable = false)
    private Long orderId; // 주문 ID 추가

    @Column(name = "option_name")
    private String optionName; // 구매한 옵션 이름

    @Column(columnDefinition = "TEXT")
    private String imageUrl; // 리뷰 이미지 URL

    @Column(name = "height")
    private Integer height;

    @Column(name = "weight")
    private Integer weight;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
