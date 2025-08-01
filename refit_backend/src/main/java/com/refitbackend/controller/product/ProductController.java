package com.refitbackend.controller.product;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.refitbackend.dto.product.CategorySubDTO;
import com.refitbackend.dto.product.ProductDetailDTO;
import com.refitbackend.dto.product.ProductImageDTO;
import com.refitbackend.service.product.CategorySubService;
import com.refitbackend.service.product.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final CategorySubService categorySubService;

    /**
     * 상품 상세 조회 (전체 이미지 포함)
     */
    @GetMapping("/{id}")
    public ProductDetailDTO getDetail(@PathVariable(name="id") Long id){
        return productService.get(id);
    }
    
    /**
     * 상품의 대표 썸네일 조회 (목록 페이지용)
     */
    // @GetMapping("/{id}/thumbnail")
    // public ProductThumbnailDTO getMainThumbnail(@PathVariable(name="id") Long id){
    //     return productThumbnailService.getMainThumbnailByProductId(id);
    // }
    
    /**
     * 평점이 지정된 값 이상인 상품들을 조회
     */
   
    
@GetMapping("/by-brand")
public List<Map<String, List<ProductImageDTO>>> getProductsImagesByBrandId(
        @RequestParam("brandId") Long brandId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(value = "mainCategoryId", required = false) Long mainCategoryId,
        @RequestParam(value = "subCategoryId", required = false) Long subCategoryId) {

    Pageable pageable = PageRequest.of(page, size);
    List<List<ProductImageDTO>> imageLists = productService.getProductsImagesByBrandId(brandId,mainCategoryId, subCategoryId, pageable);

    return imageLists.stream()
            .map(images -> Map.of("images", images))
            .toList();
}


    
    /**
     * 모든 서브 카테고리 조회
     */
    @GetMapping("/category")
    public List<CategorySubDTO> getAllCategories() {
        return categorySubService.getAllCategorySubs();
    }

    @GetMapping("/category/{mainCategoryId}")
public List<ProductImageDTO> getProductsByMainCategory(
        @PathVariable("mainCategoryId") Long mainCategoryId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {

    Pageable pageable = PageRequest.of(page, size);
    return productService.getProductsByMainCategoryId(mainCategoryId, pageable);
}

@GetMapping("/category/{mainCategoryId}/{subCategoryId}")
public List<ProductImageDTO> getProductsByCategory(
        @PathVariable("mainCategoryId") Long mainCategoryId,
        @PathVariable("subCategoryId") Long subCategoryId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {

    Pageable pageable = PageRequest.of(page, size);
    return productService.getProductsByCategorySubId(subCategoryId, pageable);
}
@GetMapping("/high-rated")
public List<Map<String, List<ProductImageDTO>>> getHighRatedProductsImagesOnly(
        @RequestParam(defaultValue = "4.5") Double minRating,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(value = "mainCategoryId", required = false) Long mainCategoryId,
        @RequestParam(value = "subCategoryId", required = false) Long subCategoryId
) {
    Pageable pageable = PageRequest.of(page, size);

    List<List<ProductImageDTO>> imageLists =
            productService.getHighRatedProductsImagesOnly(minRating, mainCategoryId, subCategoryId, pageable);

    return imageLists.stream()
            .map(images -> Map.of("images", images))
            .toList();
}

   /**
     * 최신 상품 이미지 리스트 조회
     */
    @GetMapping("/new")
public List<Map<String, List<ProductImageDTO>>> getNewProductsImages(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(value = "mainCategoryId", required = false) Long mainCategoryId,
        @RequestParam(value = "subCategoryId", required = false) Long subCategoryId) {

    Pageable pageable = PageRequest.of(page, size);
    List<List<ProductImageDTO>> imageLists = productService.getNewProductsImages( mainCategoryId, subCategoryId, pageable);

    return imageLists.stream()
            .map(images -> Map.of("images", images))
            .toList();
}

    /**
     * 가성비 좋은 고평점 상품 이미지 리스트 조회
     */
    @GetMapping("/affordable")
public List<Map<String, List<ProductImageDTO>>> getAffordableHighRatedProductsImages(
        @RequestParam("maxPrice") Integer maxPrice,
        @RequestParam("minRating") Double minRating,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(value = "mainCategoryId", required = false) Long mainCategoryId,
        @RequestParam(value = "subCategoryId", required = false) Long subCategoryId) {

    Pageable pageable = PageRequest.of(page, size);
    List<List<ProductImageDTO>> imageLists = productService.getAffordableHighRatedProductsImages(maxPrice, minRating, mainCategoryId, subCategoryId, pageable);

    return imageLists.stream()
            .map(images -> Map.of("images", images))
            .toList();
}

    /**
     * 특정 상품의 평점 업데이트
     */
    @PostMapping("/{productId}/update-rating")
    public ResponseEntity<String> updateProductRating(@PathVariable Long productId) {
        try {
            productService.updateProductRating(productId);
            return ResponseEntity.ok("상품 평점이 업데이트되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("평점 업데이트 실패: " + e.getMessage());
        }
    }

    /**
     * 모든 상품의 평점 업데이트
     */
    @PostMapping("/update-all-ratings")
    public ResponseEntity<String> updateAllProductRatings() {
        try {
            productService.updateAllProductRatings();
            return ResponseEntity.ok("모든 상품 평점이 업데이트되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("평점 업데이트 실패: " + e.getMessage());
        }
    }
    @GetMapping("/recommendations/{memberId}")
    public Page<ProductImageDTO> getRecommendedProducts(
            @PathVariable String memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return productService.getRecommendedProducts(memberId, pageable);
    }

}
    

