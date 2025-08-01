package com.refitbackend.service.product;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.refitbackend.domain.product.Product;
import com.refitbackend.domain.product.ProductImage;
import com.refitbackend.dto.product.ProductImageDTO;
import com.refitbackend.repository.product.ProductImageRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository productImageRepository;

    @Override
    public List<ProductImageDTO> getByProductId(Long productId) {
        // N+1 문제 해결을 위해 fetch join 사용
        return productImageRepository.findByProductIdWithFetch(productId).stream() 
                .map(this::entityToDTO)
                .toList();
    }

    @Override
    public Map<Long, List<ProductImageDTO>> getByProductIds(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Map.of();
        }
        
        // N+1 문제 해결을 위해 fetch join 사용
        List<ProductImage> images = productImageRepository.findByProductIdsWithFetch(productIds);
        
        // 상품 ID별로 그룹화
        return images.stream()
                .collect(Collectors.groupingBy(
                    image -> image.getProduct().getId(),
                    Collectors.mapping(this::entityToDTO, Collectors.toList())
                ));
    }

private ProductImageDTO entityToDTO(ProductImage productImage) {
    Product product = productImage.getProduct();

    return ProductImageDTO.builder()
            .id(productImage.getId())
            .url(productImage.getUrl())
            .urlThumbnail(productImage.getUrlThumbnail())
            .altText(productImage.getAltText())
            .isThumbnail(productImage.getIsThumbnail())
            .imageOrder(productImage.getImageOrder())
            .productId(product != null ? product.getId() : null)
            .productName(product != null ? product.getName() : null)
            .productRating(product != null ? product.getRating() : null)
            .productBasePrice(product != null ? product.getBasePrice() : null)
            .brandName(product != null && product.getBrand() != null ? product.getBrand().getName() : null)
            .reviewCount(product != null ? product.getReviews().size() : 0)  // 이제 fetch join으로 미리 로드됨
            .build();
}

}