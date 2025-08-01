package com.refitbackend.controller;

import com.refitbackend.dto.review.ReviewRequestDTO;
import com.refitbackend.dto.review.ReviewResponseDTO;
import com.refitbackend.service.review.ReviewService;
import com.refitbackend.service.FileStorageService;
import com.refitbackend.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Log4j2
public class ReviewController {

    private final ReviewService reviewService;
    private final FileStorageService fileStorageService;
    private final JWTUtil jwtUtil;

    // 리뷰 작성
    @PostMapping
    public ResponseEntity<ReviewResponseDTO> createReview(
            @RequestBody ReviewRequestDTO requestDTO,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            // JWT 토큰에서 회원 이메일 추출
            String token = authHeader.substring(7); // "Bearer " 제거
            Map<String, Object> claims = jwtUtil.validateToken(token);
            String memberEmail = (String) claims.get("email");
            
            log.info("리뷰 작성 요청: productId={}, memberEmail={}", requestDTO.getProductId(), memberEmail);
            
            ReviewResponseDTO responseDTO = reviewService.createReview(requestDTO, memberEmail);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("리뷰 작성 실패: {}", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // 리뷰 수정
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDTO> updateReview(
            @PathVariable Long reviewId,
            @RequestBody ReviewRequestDTO requestDTO,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            String token = authHeader.substring(7);
            Map<String, Object> claims = jwtUtil.validateToken(token);
            String memberEmail = (String) claims.get("email");
            
            log.info("리뷰 수정 요청: reviewId={}, memberEmail={}", reviewId, memberEmail);
            
            ReviewResponseDTO responseDTO = reviewService.updateReview(reviewId, requestDTO, memberEmail);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("리뷰 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            String token = authHeader.substring(7);
            Map<String, Object> claims = jwtUtil.validateToken(token);
            String memberEmail = (String) claims.get("email");
            
            log.info("리뷰 삭제 요청: reviewId={}, memberEmail={}", reviewId, memberEmail);
            
            reviewService.deleteReview(reviewId, memberEmail);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("리뷰 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 상품별 리뷰 조회
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByProductId(@PathVariable Long productId) {
        try {
            log.info("상품별 리뷰 조회 요청: productId={}", productId);
            
            List<ReviewResponseDTO> reviews = reviewService.getReviewsByProductId(productId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            log.error("상품별 리뷰 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 상품별 리뷰 조회 (정렬 옵션 포함)
    @GetMapping("/product/{productId}/sort")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByProductIdWithSort(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "latest") String sortBy) {
        try {
            log.info("상품별 리뷰 조회 요청 (정렬): productId={}, sortBy={}", productId, sortBy);
            
            List<ReviewResponseDTO> reviews = reviewService.getReviewsByProductIdWithSort(productId, sortBy);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            log.error("상품별 리뷰 조회 실패 (정렬): {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 회원별 리뷰 조회
    @GetMapping("/member")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByMember(
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            String token = authHeader.substring(7);
            Map<String, Object> claims = jwtUtil.validateToken(token);
            String memberEmail = (String) claims.get("email");
            
            log.info("회원별 리뷰 조회 요청: memberEmail={}", memberEmail);
            
            List<ReviewResponseDTO> reviews = reviewService.getReviewsByMemberEmail(memberEmail);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            log.error("회원별 리뷰 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 특정 리뷰 조회
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDTO> getReviewById(@PathVariable Long reviewId) {
        try {
            log.info("리뷰 조회 요청: reviewId={}", reviewId);
            
            ReviewResponseDTO review = reviewService.getReviewById(reviewId);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            log.error("리뷰 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 상품별 평균 평점 조회
    @GetMapping("/product/{productId}/average-rating")
    public ResponseEntity<Map<String, Object>> getAverageRatingByProductId(@PathVariable Long productId) {
        try {
            log.info("상품별 평균 평점 조회 요청: productId={}", productId);
            
            Double averageRating = reviewService.getAverageRatingByProductId(productId);
            long reviewCount = reviewService.getReviewCountByProductId(productId);
            
            Map<String, Object> response = Map.of(
                "productId", productId,
                "averageRating", averageRating != null ? averageRating : 0.0,
                "reviewCount", reviewCount
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("상품별 평균 평점 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 리뷰 이미지 업로드
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadReviewImage(
            @RequestParam("image") MultipartFile image,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            // JWT 토큰에서 회원 이메일 추출
            String token = authHeader.substring(7);
            Map<String, Object> claims = jwtUtil.validateToken(token);
            String memberEmail = (String) claims.get("email");
            
            log.info("리뷰 이미지 업로드 요청: memberEmail={}", memberEmail);
            
            // 파일 유효성 검사
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "이미지 파일이 없습니다."));
            }
            
            if (!image.getContentType().startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "이미지 파일만 업로드 가능합니다."));
            }
            
            if (image.getSize() > 5 * 1024 * 1024) { // 5MB 제한
                return ResponseEntity.badRequest().body(Map.of("error", "이미지 파일 크기는 5MB 이하여야 합니다."));
            }
            
            // 파일 저장 (reviewimages 폴더에 저장)
            String filePath = fileStorageService.storeFile(image, "reviewimages");
            String imageUrl = filePath; // 이미 /reviewimages/파일명 형태로 반환됨
            
            log.info("리뷰 이미지 업로드 성공: filePath={}", filePath);
            
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            log.error("리뷰 이미지 업로드 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "이미지 업로드에 실패했습니다."));
        }
    }
} 