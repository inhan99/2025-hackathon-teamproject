package com.refitbackend.repository.review;

import com.refitbackend.domain.review.Review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 상품별 리뷰 조회 (최신순)
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    
    // 상품별 리뷰 조회 (평점 높은순)
    List<Review> findByProductIdOrderByRatingDesc(Long productId);
    
    // 상품별 리뷰 조회 (평점 낮은순)
    List<Review> findByProductIdOrderByRatingAsc(Long productId);
    
    // 회원별 리뷰 조회 (최신순)
    List<Review> findByMemberEmailOrderByCreatedAtDesc(String memberEmail);
    
    // 특정 주문의 특정 회원 리뷰 조회 (중복 방지용)
    Optional<Review> findByProductIdAndOrderIdAndMemberEmail(Long productId, Long orderId, String memberEmail);
    
    // 상품별 리뷰 개수 조회
    long countByProductId(Long productId);
    
    // 상품별 평균 평점 조회
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    //신체기반 상품 추천 로직
    
    @Query(value = """
        SELECT r.product.id 
        FROM Review r
        WHERE ABS(r.height - :height) <= 3
          AND ABS(r.weight - :weight) <= 3
        GROUP BY r.product.id
        ORDER BY AVG(r.rating) DESC, COUNT(r.id) DESC
    """, countQuery = """
        SELECT COUNT(DISTINCT r.product.id)
        FROM Review r
        WHERE ABS(r.height - :height) <= 3
          AND ABS(r.weight - :weight) <= 3
    """)
    Page<Long> findRecommendedProductIds(@Param("height") double height,
                                         @Param("weight") double weight,
                                         Pageable pageable);
}
