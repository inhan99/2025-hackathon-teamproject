package com.refitbackend.controller.product;

import com.refitbackend.dto.product.ProductImageDTO;
import com.refitbackend.service.product.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    /**
     * 통합 검색 - 상품명, 브랜드명, 설명, 카테고리에서 키워드 검색
     */
    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> searchProducts(
            @RequestParam("keyword") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            log.info("검색 요청: keyword={}, page={}, size={}", keyword, page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            List<ProductImageDTO> products = searchService.searchProducts(keyword, pageable);
            long totalCount = searchService.getSearchResultCount(keyword);
            
            Map<String, Object> response = Map.of(
                "products", products,
                "totalCount", totalCount,
                "currentPage", page,
                "pageSize", size,
                "keyword", keyword
            );
            
            log.info("검색 완료: {}개 상품 발견", products.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("검색 중 오류 발생", e);
            return ResponseEntity.badRequest().body(Map.of("error", "검색 중 오류가 발생했습니다."));
        }
    }

    /**
     * 브랜드별 검색
     */
    @GetMapping("/brand")
    public ResponseEntity<Map<String, Object>> searchByBrand(
            @RequestParam("brand") String brandName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            log.info("브랜드 검색 요청: brand={}, page={}, size={}", brandName, page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            List<ProductImageDTO> products = searchService.searchByBrand(brandName, pageable);
            
            Map<String, Object> response = Map.of(
                "products", products,
                "currentPage", page,
                "pageSize", size,
                "brandName", brandName
            );
            
            log.info("브랜드 검색 완료: {}개 상품 발견", products.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("브랜드 검색 중 오류 발생", e);
            return ResponseEntity.badRequest().body(Map.of("error", "브랜드 검색 중 오류가 발생했습니다."));
        }
    }

    /**
     * 카테고리별 검색
     */
    @GetMapping("/category")
    public ResponseEntity<Map<String, Object>> searchByCategory(
            @RequestParam("category") String categoryName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            log.info("카테고리 검색 요청: category={}, page={}, size={}", categoryName, page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            List<ProductImageDTO> products = searchService.searchByCategory(categoryName, pageable);
            
            Map<String, Object> response = Map.of(
                "products", products,
                "currentPage", page,
                "pageSize", size,
                "categoryName", categoryName
            );
            
            log.info("카테고리 검색 완료: {}개 상품 발견", products.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("카테고리 검색 중 오류 발생", e);
            return ResponseEntity.badRequest().body(Map.of("error", "카테고리 검색 중 오류가 발생했습니다."));
        }
    }
} 