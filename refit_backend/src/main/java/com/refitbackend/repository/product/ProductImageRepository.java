package com.refitbackend.repository.product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.refitbackend.domain.product.ProductImage;

/**
 * 상품 원본 이미지 전용 Repository
 * 상세 페이지에서 사용할 전체 이미지 정보 제공
 */
@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long>{
    
    /**
     * 상품의 모든 이미지 조회 (N+1 문제 해결을 위한 fetch join)
     */
    @Query("SELECT pi FROM ProductImage pi " +
           "LEFT JOIN FETCH pi.product p " +
           "LEFT JOIN FETCH p.brand " +
           "LEFT JOIN FETCH p.reviews " +
           "WHERE pi.product.id = :productId " +
           "ORDER BY pi.imageOrder ASC")
    List<ProductImage> findByProductIdWithFetch(@Param("productId") Long productId);
    
    /**
     * 여러 상품의 이미지를 한 번에 조회 (N+1 문제 해결)
     */
    @Query("SELECT pi FROM ProductImage pi " +
           "LEFT JOIN FETCH pi.product p " +
           "LEFT JOIN FETCH p.brand " +
           "LEFT JOIN FETCH p.reviews " +
           "WHERE pi.product.id IN :productIds " +
           "ORDER BY pi.product.id, pi.imageOrder ASC")
    List<ProductImage> findByProductIdsWithFetch(@Param("productIds") List<Long> productIds);
    
    /**
     * 상품의 모든 이미지 조회 (기존 메서드 유지)
     */
    List<ProductImage> findByProductId(Long productId);
    
    /**
     * 상품의 모든 이미지를 순서대로 조회
     */
    @Query("SELECT pi FROM ProductImage pi WHERE pi.product.id = :productId ORDER BY pi.imageOrder ASC")
    List<ProductImage> findByProductIdOrderByImageOrderAsc(@Param("productId") Long productId);
    
    /**
     * 상품의 썸네일 이미지만 조회 (isThumbnail = true인 것들)
     */
    List<ProductImage> findByProductIdAndIsThumbnailTrue(Long productId);
    
    /**
     * 상품의 일반 이미지만 조회 (isThumbnail = false인 것들)
     */
    List<ProductImage> findByProductIdAndIsThumbnailFalse(Long productId);
    
    /**
     * 상품 ID로 이미지 삭제
     */
    void deleteByProductId(Long productId);
}