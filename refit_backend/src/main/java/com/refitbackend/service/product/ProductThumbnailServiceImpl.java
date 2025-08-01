package com.refitbackend.service.product;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.refitbackend.domain.product.ProductThumbnail;
import com.refitbackend.dto.product.ProductThumbnailDTO;
import com.refitbackend.repository.product.ProductThumbnailRepository;

import lombok.RequiredArgsConstructor;

/**
 * 상품 썸네일 전용 서비스 구현체
 * 목록 페이지에서 사용할 썸네일 관련 기능 제공
 */
@Service
@RequiredArgsConstructor
public class ProductThumbnailServiceImpl implements ProductThumbnailService {

    private final ProductThumbnailRepository productThumbnailRepository;

    @Override
    public List<ProductThumbnailDTO> getThumbnailsByProductId(Long productId) {
        return productThumbnailRepository.findByProductIdOrderByImageOrderAsc(productId)
                .stream()
                .map(this::entityToThumbnailDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductThumbnailDTO getMainThumbnailByProductId(Long productId) {
        return productThumbnailRepository.findFirstByProductIdOrderByImageOrderAsc(productId)
                .map(this::entityToThumbnailDTO)
                .orElse(null);
    }

    @Override
    public List<ProductThumbnailDTO> getMainThumbnailsByProductIds(List<Long> productIds) {
        return productThumbnailRepository.findMainThumbnailsByProductIds(productIds)
                .stream()
                .map(this::entityToThumbnailDTO)
                .collect(Collectors.toList());
    }

    /**
     * ProductThumbnail 엔티티를 ProductThumbnailDTO로 변환
     */
    private ProductThumbnailDTO entityToThumbnailDTO(ProductThumbnail productThumbnail) {
        return ProductThumbnailDTO.builder()
                .id(productThumbnail.getId())
                .urlThumbnail(productThumbnail.getUrlThumbnail())
                .altText(productThumbnail.getAltText())
                .imageOrder(productThumbnail.getImageOrder())
                .productId(productThumbnail.getProduct() != null ? productThumbnail.getProduct().getId() : null)
                .build();
    }
} 