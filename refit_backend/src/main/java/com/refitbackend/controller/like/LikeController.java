package com.refitbackend.controller.like;

import com.refitbackend.domain.product.Product;
import com.refitbackend.service.like.LikeService;
import com.refitbackend.util.CustomJWTException;
import com.refitbackend.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;
    private final JWTUtil jwtUtil;

    private String extractEmail(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new CustomJWTException("토큰 없음");
        }

        String token = authorizationHeader.substring(7);
        Map<String, Object> claims = jwtUtil.validateToken(token);
        String email = (String) claims.get("email");

        if (email == null) {
            throw new CustomJWTException("이메일 없음");
        }

        return email;
    }

    @PostMapping("/{productId}")
    public ResponseEntity<String> likeProduct(
        @PathVariable Long productId,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        try {
            String email = extractEmail(authorizationHeader);
            likeService.likeProduct(productId, email);
            return ResponseEntity.ok("좋아요 완료");
        } catch (CustomJWTException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰 오류: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> unlikeProduct(
        @PathVariable Long productId,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        try {
            String email = extractEmail(authorizationHeader);
            likeService.unlikeProduct(productId, email);
            return ResponseEntity.ok("좋아요 취소");
        } catch (CustomJWTException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰 오류: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
        }
    }

    @GetMapping
    public ResponseEntity<?> getLikedProducts(
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        try {
            String email = extractEmail(authorizationHeader);
            List<Product> likedProducts = likeService.getLikedProducts(email);
            return ResponseEntity.ok(likedProducts);
        } catch (CustomJWTException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰 오류: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
        }
    }

    @GetMapping("/count/{productId}")
    public ResponseEntity<Long> countLikes(@PathVariable Long productId) {
        long count = likeService.countLikes(productId);
        return ResponseEntity.ok(count);
    }
}
