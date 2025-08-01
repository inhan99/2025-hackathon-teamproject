package com.refitbackend.service.product;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import com.refitbackend.dto.product.ProductDetailDTO;
import com.refitbackend.dto.product.ProductImageDTO;

@Transactional
public interface ProductService {

    // 상세 페이지용도
    ProductDetailDTO get(Long id);

    // 평점 높은 상품 이미지들 (페이징)
    List<List<ProductImageDTO>> getHighRatedProductsImagesOnly(Double minRating,  Long mainCategoryId,
    Long subCategoryId, Pageable pageable);

    // 브랜드별 상품 이미지 (페이징)
    List<List<ProductImageDTO>> getProductsImagesByBrandId(Long brandId, Long mainCategoryId,
    Long subCategoryId, Pageable pageable);
    
    // 최신 상품 이미지 (페이징)
    List<List<ProductImageDTO>> getNewProductsImages(Long mainCategoryId,
    Long subCategoryId, Pageable pageable);

    // 가성비 + 평점 조건 상품 (페이징)
    List<List<ProductImageDTO>> getAffordableHighRatedProductsImages(Integer maxPrice, Double minRating, Long mainCategoryId,
    Long subCategoryId, Pageable pageable);

    // 서브 카테고리별 상품 (페이징)
    List<ProductImageDTO> getProductsByCategorySubId(Long subCategoryId, Pageable pageable);

    // 메인 카테고리별 상품 (페이징)
    List<ProductImageDTO> getProductsByMainCategoryId(Long mainCategoryId, Pageable pageable);

    
    // 상품 평점 업데이트
    void updateProductRating(Long productId);
    
    // 모든 상품 평점 업데이트
    void updateAllProductRatings();
    
    //추천 
    Page<ProductImageDTO> getRecommendedProducts(String memberId, Pageable pageable);

}
