package com.refitbackend.controller.donation;

import com.refitbackend.dto.donation.DonationProductsDetailDTO;
import com.refitbackend.dto.donation.DonationRequestDTO;
import com.refitbackend.domain.donation.DonationStatus;
import com.refitbackend.domain.member.Member;
import com.refitbackend.dto.donation.DonationProductSummaryDTO;
import com.refitbackend.service.donation.DonationProductService;
import com.refitbackend.util.CustomJWTException;
import com.refitbackend.util.JWTUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donation")
@RequiredArgsConstructor
@Log4j2
public class DonationController {

    private final DonationProductService donationProductService;
    private final JWTUtil jwtUtil;
    /**
     * ✅ 전체 기부 상품 목록 조회 (APPROVED 상태만)
     * GET /api/donation/products
     * 
     * 
     */
    @GetMapping("/products/category/{categoryId}")
    public ResponseEntity<List<DonationProductsDetailDTO>> getApprovedDonationProductsByCategory(
            @PathVariable Long categoryId) {
                log.info("categoryId = {}", categoryId);
                List<DonationProductsDetailDTO> products = donationProductService.getApprovedDonationProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }
    @GetMapping("/products")
    public ResponseEntity<List<DonationProductsDetailDTO>> getApprovedDonationProducts() {
        return ResponseEntity.ok(donationProductService.getApprovedDonationProducts());
    }
    @GetMapping("/products/inspecting")
    public ResponseEntity<List<DonationProductSummaryDTO>> getInsepectingDonationProducts() {
        return ResponseEntity.ok(donationProductService.getInspectingDonationProducts());
    }

    /**
     * ✅ 원본 상품 ID로 기부 상품 조회 (APPROVED 상태)
     * GET /api/donation/products/by-original/{originalId}
     */
    @GetMapping("/products/filter/original/{originalId}")
    public ResponseEntity<List<DonationProductsDetailDTO>> getAllByOriginalId(@PathVariable Long originalId) {
        log.info("controller요청 들어옴");
        return ResponseEntity.ok(donationProductService.getAllByOriginalId(originalId));
    }

    // 🔜 추후에 추가될 예정인 기능들
    // @PostMapping("/products") → 기부상품 등록
    // @PatchMapping("/products/{id}/status") → 관리자 상태 변경
    // @PatchMapping("/products/{id}/complete") → 나눔 완료 처리
    
    //나눔 등록ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ
     @PostMapping
    public ResponseEntity<?> createDonation(
        @RequestPart("donation") DonationRequestDTO donationDTO,
        @RequestPart(value = "images", required = false) MultipartFile[] images,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        try {
            // 1. Authorization 헤더에서 Bearer 토큰 분리
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
            }
            String token = authorizationHeader.substring(7);

            // 2. 토큰 유효성 검사 및 클레임 추출
            Map<String, Object> claims = jwtUtil.validateToken(token);

            // 3. 클레임에서 사용자 정보 꺼내기 (예: email)
            String userEmail = (String) claims.get("email");
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
            }

            // 4. 사용자 조회
            Member donor = donationProductService.findMemberByEmail(userEmail);

            // 5. 기부 저장 서비스 호출
            donationProductService.saveDonation(donationDTO, donor, images);

            return ResponseEntity.ok("나눔 신청 완료");
        } catch (CustomJWTException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰 오류: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류 발생");
        }
    }
    // ===================================================================================
    // [추가] 기부물품 상세 조회 API
    @GetMapping("/products/{id}")
    public ResponseEntity<DonationProductsDetailDTO> getDonationProductDetail(@PathVariable Long id) {
        // 서비스에서 상세 DTO를 받아와서 반환
        DonationProductsDetailDTO dto = donationProductService.getDonationProductDetailById(id);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/products/{id}/status")
public ResponseEntity<?> updateDonationProductStatus(
        @PathVariable Long id,
        @RequestParam("status") String statusStr,
        @RequestHeader("Authorization") String authorizationHeader) {
    try {
        // 토큰 검증 로직 (createDonation 메서드와 동일하게 처리)
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
        }
        String token = authorizationHeader.substring(7);
        Map<String, Object> claims = jwtUtil.validateToken(token);
        String userEmail = (String) claims.get("email");
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
        }

        // 관리자 권한 체크 로직 필요 시 추가 (생략 가능)

        // 전달받은 상태 문자열을 DonationStatus enum으로 변환
        DonationStatus newStatus;
        try {
            newStatus = DonationStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("유효하지 않은 상태 값입니다.");
        }

        // 상태 변경 서비스 호출
        donationProductService.updateDonationProductStatus(id, newStatus);

        return ResponseEntity.ok("기부상품 상태가 변경되었습니다.");
    } catch (CustomJWTException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰 오류: " + e.getMessage());
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류 발생");
    }
}
  // ===================================================================================
    // ✅ [추가] 카테고리별 기부 상품 목록 조회 API (APPROVED 상태만)
    // ✅ 예: /api/donation/products/filter/category/1 → 상의 카테고리
    
}

