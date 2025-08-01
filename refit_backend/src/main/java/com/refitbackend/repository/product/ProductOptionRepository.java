package com.refitbackend.repository.product;

import com.refitbackend.domain.product.ProductOption;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProductOptionRepository extends JpaRepository<ProductOption, Long> {

    // 특정 상품에 속한 옵션 중 하나를 ID로 조회 (안전하게 productId까지 체크)
    @Query("SELECT po FROM ProductOption po WHERE po.id = :optionId AND po.product.id = :productId")
    Optional<ProductOption> findByIdAndProductId(Long optionId, Long productId);

    // 재고 있는 옵션인지 체크할 때 사용
    @Query("SELECT po FROM ProductOption po WHERE po.id = :optionId AND po.stock > 0")
    Optional<ProductOption> findAvailableOptionById(Long optionId);

    @Transactional
    @Modifying
    @Query("UPDATE ProductOption po SET po.stock = po.stock - :quantity WHERE po.id = :optionId AND po.stock >= :quantity")
    int decreaseStock(Long optionId, int quantity);

}
