package com.refitbackend.service.review;

import com.refitbackend.dto.review.ReviewRequestDTO;
import com.refitbackend.dto.review.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {
    // 리뷰 작성
    ReviewResponseDTO createReview(ReviewRequestDTO requestDTO, String memberEmail);
    
    // 리뷰 수정
    ReviewResponseDTO updateReview(Long reviewId, ReviewRequestDTO requestDTO, String memberEmail);
    
    // 리뷰 삭제
    void deleteReview(Long reviewId, String memberEmail);
    
    // 상품별 리뷰 조회
    List<ReviewResponseDTO> getReviewsByProductId(Long productId);
    
    // 상품별 리뷰 조회 (정렬 옵션 포함)
    List<ReviewResponseDTO> getReviewsByProductIdWithSort(Long productId, String sortBy);
    
    // 회원별 리뷰 조회
    List<ReviewResponseDTO> getReviewsByMemberEmail(String memberEmail);
    
    // 특정 리뷰 조회
    ReviewResponseDTO getReviewById(Long reviewId);
    
    // 상품별 평균 평점 조회
    Double getAverageRatingByProductId(Long productId);
    
    // 상품별 리뷰 개수 조회
    long getReviewCountByProductId(Long productId);
} 