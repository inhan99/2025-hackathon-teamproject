package com.refitbackend.repository.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.refitbackend.domain.product.ProductThumbnail;

/**
 * 상품 썸네일 전용 Repository
 * 목록 페이지에서 사용할 썸네일 관련 쿼리 제공
 */
@Repository
public interface ProductThumbnailRepository extends JpaRepository<ProductThumbnail, Long> {
    
    /**
     * 상품의 모든 썸네일 조회
     */
    List<ProductThumbnail> findByProductId(Long productId);
    
    /**
     * 상품의 모든 썸네일을 순서대로 조회
     */
    @Query("SELECT pt FROM ProductThumbnail pt WHERE pt.product.id = :productId ORDER BY pt.imageOrder ASC")
    List<ProductThumbnail> findByProductIdOrderByImageOrderAsc(@Param("productId") Long productId);
    
    /**
     * 상품의 대표 썸네일 하나만 조회 (imageOrder가 가장 작은 것)
     */
    @Query("SELECT pt FROM ProductThumbnail pt WHERE pt.product.id = :productId ORDER BY pt.imageOrder ASC LIMIT 1")
    Optional<ProductThumbnail> findFirstByProductIdOrderByImageOrderAsc(@Param("productId") Long productId);
    
    /**
     * 여러 상품의 대표 썸네일 조회 (목록 페이지용)
     */
    @Query("SELECT pt FROM ProductThumbnail pt WHERE pt.product.id IN :productIds AND pt.imageOrder = (SELECT MIN(pt2.imageOrder) FROM ProductThumbnail pt2 WHERE pt2.product.id = pt.product.id)")
    List<ProductThumbnail> findMainThumbnailsByProductIds(@Param("productIds") List<Long> productIds);
    
    /**
     * 상품 ID로 썸네일 삭제
     */
    void deleteByProductId(Long productId);
} 