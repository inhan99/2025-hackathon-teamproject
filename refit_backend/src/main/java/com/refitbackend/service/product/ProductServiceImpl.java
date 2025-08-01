package com.refitbackend.service.product;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.member.MemberBodyInfo;
import com.refitbackend.domain.product.Product;
import com.refitbackend.dto.product.ProductDetailDTO;
import com.refitbackend.dto.product.ProductImageDTO;
import com.refitbackend.dto.product.ProductOptionDTO;
import com.refitbackend.repository.member.MemberBodyInfoRepository;
import com.refitbackend.repository.member.MemberRepository;
import com.refitbackend.repository.product.ProductRepository;
import com.refitbackend.repository.review.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductImageService productImageService;
    private final ReviewRepository reviewRepository; 
    private final MemberRepository memberRepository;
    private final MemberBodyInfoRepository memberBodyInfoRepository;

    @Override
    public ProductDetailDTO get(Long id) {
        Product product = productRepository.selectOne(id)
                .orElseThrow(() -> new RuntimeException("상품 로딩 실패..."));

        List<ProductImageDTO> images = productImageService.getByProductId(product.getId());

        return entityToDTO(product, images);
    }

 // 평점 높은 상품 (페이징 적용)
@Override
public List<List<ProductImageDTO>> getHighRatedProductsImagesOnly(Double minRating,  Long mainCategoryId,
Long subCategoryId, Pageable pageable) {
    Page<Product> productsPage = productRepository.findByRatingGreaterThanEqualOrderByRatingDesc(minRating, mainCategoryId, subCategoryId, pageable);
    List<Product> products = productsPage.getContent();
    
    if (products.isEmpty()) {
        return List.of();
    }
    
    // 상품 ID 목록 추출
    List<Long> productIds = products.stream()
            .map(Product::getId)
            .collect(Collectors.toList());
    
    // 한 번에 모든 이미지 조회
    Map<Long, List<ProductImageDTO>> imagesMap = productImageService.getByProductIds(productIds);
    
    // 상품 순서대로 이미지 반환
    return products.stream()
            .map(product -> imagesMap.getOrDefault(product.getId(), List.of()))
            .collect(Collectors.toList());
}

// 브랜드별 상품 (페이징 적용)
@Override
public List<List<ProductImageDTO>> getProductsImagesByBrandId(Long brandId, Long mainCategoryId,
Long subCategoryId, Pageable pageable) {
    Page<Product> productsPage = productRepository.findByBrandId(brandId, mainCategoryId, subCategoryId,pageable);
    List<Product> products = productsPage.getContent();
    
    if (products.isEmpty()) {
        return List.of();
    }
    
    // 상품 ID 목록 추출
    List<Long> productIds = products.stream()
            .map(Product::getId)
            .collect(Collectors.toList());
    
    // 한 번에 모든 이미지 조회
    Map<Long, List<ProductImageDTO>> imagesMap = productImageService.getByProductIds(productIds);
    
    // 상품 순서대로 이미지 반환
    return products.stream()
            .map(product -> imagesMap.getOrDefault(product.getId(), List.of()))
            .collect(Collectors.toList());
}


// 최신 상품 (페이징 적용)
@Override
public List<List<ProductImageDTO>> getNewProductsImages(Long mainCategoryId,
Long subCategoryId, Pageable pageable) {
    Page<Product> productsPage = productRepository.findByStatusActiveOrderByCreatedAtDesc(mainCategoryId, subCategoryId, pageable);
    List<Product> products = productsPage.getContent();
    
    if (products.isEmpty()) {
        return List.of();
    }
    
    // 상품 ID 목록 추출
    List<Long> productIds = products.stream()
            .map(Product::getId)
            .collect(Collectors.toList());
    
    // 한 번에 모든 이미지 조회
    Map<Long, List<ProductImageDTO>> imagesMap = productImageService.getByProductIds(productIds);
    
    // 상품 순서대로 이미지 반환
    return products.stream()
            .map(product -> imagesMap.getOrDefault(product.getId(), List.of()))
            .collect(Collectors.toList());
}

// 가성비 상품 (페이징 적용)
@Override
public List<List<ProductImageDTO>> getAffordableHighRatedProductsImages(Integer maxPrice, Double minRating, Long mainCategoryId,
Long subCategoryId, Pageable pageable) {
    Page<Product> productsPage = productRepository.findAllAffordableHighRated(maxPrice, minRating, mainCategoryId, subCategoryId, pageable);
    List<Product> products = productsPage.getContent();
    
    if (products.isEmpty()) {
        return List.of();
    }
    
    // 상품 ID 목록 추출
    List<Long> productIds = products.stream()
            .map(Product::getId)
            .collect(Collectors.toList());
    
    // 한 번에 모든 이미지 조회
    Map<Long, List<ProductImageDTO>> imagesMap = productImageService.getByProductIds(productIds);
    
    // 상품 순서대로 이미지 반환
    return products.stream()
            .map(product -> imagesMap.getOrDefault(product.getId(), List.of()))
            .collect(Collectors.toList());
}

// 서브 카테고리 (페이징 적용)
@Override
public List<ProductImageDTO> getProductsByCategorySubId(Long subCategoryId, Pageable pageable) {
    Page<Product> productsPage = productRepository.findByCategorySubId(subCategoryId, pageable);
    List<Product> products = productsPage.getContent();
    
    if (products.isEmpty()) {
        return List.of();
    }
    
    // 상품 ID 목록 추출
    List<Long> productIds = products.stream()
            .map(Product::getId)
            .collect(Collectors.toList());
    
    // 한 번에 모든 이미지 조회
    Map<Long, List<ProductImageDTO>> imagesMap = productImageService.getByProductIds(productIds);
    
    // 모든 이미지를 하나의 리스트로 평탄화
    return products.stream()
            .flatMap(product -> imagesMap.getOrDefault(product.getId(), List.of()).stream())
            .collect(Collectors.toList());
}

// 메인 카테고리 (페이징 적용)
@Override
public List<ProductImageDTO> getProductsByMainCategoryId(Long mainCategoryId, Pageable pageable) {
    Page<Product> productsPage = productRepository.findByCategoryId(mainCategoryId, pageable);
    List<Product> products = productsPage.getContent();
    
    if (products.isEmpty()) {
        return List.of();
    }
    
    // 상품 ID 목록 추출
    List<Long> productIds = products.stream()
            .map(Product::getId)
            .collect(Collectors.toList());
    
    // 한 번에 모든 이미지 조회
    Map<Long, List<ProductImageDTO>> imagesMap = productImageService.getByProductIds(productIds);
    
    // 모든 이미지를 하나의 리스트로 평탄화
    return products.stream()
            .flatMap(product -> imagesMap.getOrDefault(product.getId(), List.of()).stream())
            .collect(Collectors.toList());
}



    private ProductDetailDTO entityToDTO(Product product, List<ProductImageDTO> images) {
        // ProductOption을 ProductOptionDTO로 변환
        List<ProductOptionDTO> options = product.getOptions().stream()
                .map(option -> ProductOptionDTO.builder()
                        .id(option.getId())
                        .size(option.getSize())
                        .stock(option.getStock())
                        .priceAdjustment(option.getPriceAdjustment())
                        .build())
                .collect(Collectors.toList());

        return ProductDetailDTO.builder()
            .id(product.getId())
            .name(product.getName())
            .description(product.getDescription())
            .basePrice(product.getBasePrice())
            .status(product.getStatus() != null ? product.getStatus().name() : null)
            .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
            .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
            .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
            .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
            .rating(product.getRating())
            .options(options)
            .images(images)
            .createdAt(product.getCreatedAt())
            .updatedAt(product.getUpdatedAt())
            .build();
    }

    @Override
    public void updateProductRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다. ID: " + productId));
        
        // 해당 상품의 리뷰 평점 평균 계산
        Double averageRating = reviewRepository.getAverageRatingByProductId(productId);
        
        // 평점 업데이트 (리뷰가 없으면 null로 설정)
        product.setRating(averageRating);
        productRepository.save(product);
    }

    @Override
    public void updateAllProductRatings() {
        // 모든 상품의 평점을 업데이트
        List<Product> products = productRepository.findAll();
        
        for (Product product : products) {
            Double averageRating = reviewRepository.getAverageRatingByProductId(product.getId());
            product.setRating(averageRating);
        }
        
        productRepository.saveAll(products);
    }

    @Override
public Page<ProductImageDTO> getRecommendedProducts(String memberId, Pageable pageable) {
    // 1. 사용자 및 신체 정보 조회
    Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

    MemberBodyInfo info = memberBodyInfoRepository.findTopByMemberEmailOrderByMeasuredAtDesc(member.getEmail())
        .orElseThrow(() -> new RuntimeException("사용자 신체정보가 없습니다."));

    // 2. 추천 상품 ID 페이지 조회 (리뷰 기반)
    Page<Long> recommendedProductIds = reviewRepository
        .findRecommendedProductIds(info.getHeight(), info.getWeight(), pageable);

    List<Long> productIdList = recommendedProductIds.getContent();

    if (productIdList.isEmpty()) {
        return Page.empty(pageable); // 빈 페이지 반환
    }

    // 3. 상품 조회
    List<Product> products = productRepository.findByIdIn(productIdList);

    // 4. ID 순서 보존 (정렬)
    Map<Long, Product> productMap = products.stream()
        .collect(Collectors.toMap(Product::getId, p -> p));

    // 5. 한 번에 모든 이미지 조회 (N+1 문제 해결)
    Map<Long, List<ProductImageDTO>> imagesMap = productImageService.getByProductIds(productIdList);

    List<ProductImageDTO> dtoList = productIdList.stream()
        .map(productMap::get)
        .filter(Objects::nonNull)
        .flatMap(product -> imagesMap.getOrDefault(product.getId(), List.of()).stream())
        .collect(Collectors.toList());

    // 6. PageImpl 생성
    return new PageImpl<>(dtoList, pageable, recommendedProductIds.getTotalElements());
}

}