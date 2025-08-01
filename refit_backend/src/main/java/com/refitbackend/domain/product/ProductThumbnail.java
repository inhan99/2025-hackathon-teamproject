package com.refitbackend.domain.product;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;

/**
 * 상품 썸네일 전용 엔티티
 * 목록 페이지에서 사용할 썸네일 정보만 포함
 */
@Entity
@Table(name = "product_thumbnails")
@Getter
@Setter
@NoArgsConstructor
public class ProductThumbnail {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String urlThumbnail;  // 썸네일 이미지 URL

    private String altText;       // 이미지 대체 텍스트

    private Integer imageOrder;   // 이미지 순서

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
} 