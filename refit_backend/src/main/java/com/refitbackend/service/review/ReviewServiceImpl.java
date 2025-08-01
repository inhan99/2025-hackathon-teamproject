package com.refitbackend.service.review;

import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.member.MemberPoint;
import com.refitbackend.domain.product.Product;
import com.refitbackend.domain.review.Review;
import com.refitbackend.dto.review.ReviewRequestDTO;
import com.refitbackend.dto.review.ReviewResponseDTO;
import com.refitbackend.repository.member.MemberRepository;
import com.refitbackend.repository.member.MemberPointRepository;
import com.refitbackend.repository.product.ProductRepository;
import com.refitbackend.repository.review.ReviewRepository;
import com.refitbackend.service.product.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;
    private final MemberPointRepository memberPointRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    // 적립금 계산 메서드
    private int calculateReviewPoints(ReviewRequestDTO requestDTO) {
        int totalPoints = 1000; // 기본 적립금 1000원
        
        // 신체정보 입력 시 +500원
        if (requestDTO.getHeight() != null && requestDTO.getWeight() != null) {
            if (requestDTO.getHeight() > 0 && requestDTO.getWeight() > 0) {
                totalPoints += 500;
            }
        }
        
        // 사진 첨부 시 +1000원
        if (requestDTO.getImageUrl() != null && !requestDTO.getImageUrl().trim().isEmpty()) {
            totalPoints += 1000;
        }
        
        return totalPoints;
    }

    // 적립금 지급 메서드
    private void addPointsToMember(String memberEmail, int points) {
        MemberPoint memberPoint = memberPointRepository.findByMemberEmail(memberEmail)
                .orElseGet(() -> {
                    Member member = memberRepository.findByEmail(memberEmail)
                            .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
                    MemberPoint newMemberPoint = new MemberPoint();
                    newMemberPoint.setMember(member);
                    newMemberPoint.setCredit(0);
                    newMemberPoint.setDonationPoint(0);
                    return memberPointRepository.save(newMemberPoint);
                });
        
        memberPoint.setCredit(memberPoint.getCredit() + points);
        memberPointRepository.save(memberPoint);
    }

    @Override
    public ReviewResponseDTO createReview(ReviewRequestDTO requestDTO, String memberEmail) {
        // 회원 조회
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        
        // 상품 조회
        Product product = productRepository.findById(requestDTO.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        
        // 이미 해당 주문에 대해 리뷰를 작성했는지 확인
        reviewRepository.findByProductIdAndOrderIdAndMemberEmail(
                requestDTO.getProductId(), 
                requestDTO.getOrderId(), 
                memberEmail)
                .ifPresent(review -> {
                    throw new IllegalArgumentException("이미 해당 주문에 대해 리뷰를 작성했습니다.");
                });
        
        // 평점 유효성 검사
        if (requestDTO.getRating() < 1.0 || requestDTO.getRating() > 5.0) {
            throw new IllegalArgumentException("평점은 1.0 ~ 5.0 사이여야 합니다.");
        }
        
        // 적립금 계산
        int earnedPoints = calculateReviewPoints(requestDTO);
        
        // 리뷰 생성
        Review review = Review.builder()
                .content(requestDTO.getContent())
                .rating(requestDTO.getRating())
                .member(member)
                .product(product)
                .orderId(requestDTO.getOrderId())
                .optionName(requestDTO.getOptionName())
                .imageUrl(requestDTO.getImageUrl())
                .weight(requestDTO.getWeight())
                .height(requestDTO.getHeight())
                .build();
        
        Review savedReview = reviewRepository.save(review);
        
        // 적립금 지급
        addPointsToMember(memberEmail, earnedPoints);
        
        // 상품 평점 업데이트
        productService.updateProductRating(requestDTO.getProductId());
        
        // 적립금 정보를 포함한 응답 생성
        ReviewResponseDTO responseDTO = ReviewResponseDTO.fromEntity(savedReview);
        responseDTO.setEarnedPoints(earnedPoints);
        
        return responseDTO;
    }

    @Override
    public ReviewResponseDTO updateReview(Long reviewId, ReviewRequestDTO requestDTO, String memberEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        
        // 본인이 작성한 리뷰인지 확인
        if (!review.getMember().getEmail().equals(memberEmail)) {
            throw new IllegalArgumentException("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }
        
        // 평점 유효성 검사
        if (requestDTO.getRating() < 1.0 || requestDTO.getRating() > 5.0) {
            throw new IllegalArgumentException("평점은 1.0 ~ 5.0 사이여야 합니다.");
        }
        
        review.setContent(requestDTO.getContent());
        review.setRating(requestDTO.getRating());
        review.setOptionName(requestDTO.getOptionName());
        review.setImageUrl(requestDTO.getImageUrl());
        
        Review updatedReview = reviewRepository.save(review);
        
        // 상품 평점 업데이트
        productService.updateProductRating(requestDTO.getProductId());
        
        return ReviewResponseDTO.fromEntity(updatedReview);
    }

    @Override
    public void deleteReview(Long reviewId, String memberEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        
        // 본인이 작성한 리뷰인지 확인
        if (!review.getMember().getEmail().equals(memberEmail)) {
            throw new IllegalArgumentException("본인이 작성한 리뷰만 삭제할 수 있습니다.");
        }
        
        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);
        
        // 상품 평점 업데이트
        productService.updateProductRating(productId);
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByProductId(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        return reviews.stream()
                .map(ReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByProductIdWithSort(Long productId, String sortBy) {
        List<Review> reviews;
        
        switch (sortBy) {
            case "rating_desc":
                reviews = reviewRepository.findByProductIdOrderByRatingDesc(productId);
                break;
            case "rating_asc":
                reviews = reviewRepository.findByProductIdOrderByRatingAsc(productId);
                break;
            case "latest":
            default:
                reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
                break;
        }
        
        return reviews.stream()
                .map(ReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByMemberEmail(String memberEmail) {
        List<Review> reviews = reviewRepository.findByMemberEmailOrderByCreatedAtDesc(memberEmail);
        return reviews.stream()
                .map(ReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewResponseDTO getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        return ReviewResponseDTO.fromEntity(review);
    }

    @Override
    public Double getAverageRatingByProductId(Long productId) {
        return reviewRepository.getAverageRatingByProductId(productId);
    }

    @Override
    public long getReviewCountByProductId(Long productId) {
        return reviewRepository.countByProductId(productId);
    }
} 