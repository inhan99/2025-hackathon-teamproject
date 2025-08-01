package com.refitbackend.repository.donation;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.refitbackend.domain.donation.DonationProduct;
import com.refitbackend.domain.donation.DonationStatus;
import com.refitbackend.domain.member.MemberRole;

@Repository
public interface DonationProductRepository extends JpaRepository<DonationProduct, Long> {

    /**
     * 특정 상태(status)를 가진 모든 기부 상품 목록 조회
     * - 예: APPROVED 상태인 나눔 상품만 조회할 때 사용
     * - 기부일자(donatedAt)를 기준으로 내림차순 정렬하여 반환
     * 
     * @param status DonationStatus enum 값
     * @return 해당 상태의 기부 상품 리스트 (donatedAt 기준 내림차순)
     */
    @Query("SELECT d FROM DonationProduct d WHERE d.status = :status ORDER BY d.donatedAt DESC")
    List<DonationProduct> findByStatusOrderByDonatedAtDesc(@Param("status") DonationStatus status);

    /**
     * 원본 상품 ID로 해당 상품에 연결된 모든 기부 상품 리스트 조회
     * - 상태 조건 없이 조회
     * 
     * @param originalProductId 원본 Product의 ID
     * @return 해당 원본 상품에 연결된 모든 기부 상품 리스트
     */
    List<DonationProduct> findAllByOriginalProduct_Id(Long originalProductId);

    /**
     * 원본 상품 ID와 상태를 조건으로 첫 번째(단건) 기부 상품 조회
     * - 예: 특정 원본 상품의 APPROVED 상태 기부 상품 단건 조회 시 사용
     * 
     * @param originalProductId 원본 Product의 ID
     * @param status DonationStatus enum 값
     * @return 조건에 맞는 단건 기부 상품 Optional
     */
    Optional<DonationProduct> findFirstByOriginalProduct_IdAndStatus(Long originalProductId, DonationStatus status);

    /**
     * 원본 상품 ID로 단건 기부 상품 조회 (상태 조건 없이)
     * - 여러 개 있을 수 있으나, 단건 조회 시 사용
     * 
     * @param originalProductId 원본 Product의 ID
     * @return 해당 원본 상품에 연결된 기부 상품 Optional
     */
    Optional<DonationProduct> findByOriginalProduct_Id(Long originalProductId);

    /**
     * 원본 상품 ID, 상태, 그리고 재고(stock) 조건으로 기부 상품 조회
     * - 재고가 0보다 큰 옵션이 있어야 결과에 포함
     * 
     * @param originalProductId 원본 Product의 ID
     * @param status DonationStatus enum 값
     * @param stock 기준 재고 수량 (주로 0)
     * @return 조건에 맞는 기부 상품 리스트
     */
    List<DonationProduct> findDistinctByOriginalProduct_IdAndStatusAndOptions_StockGreaterThan(
        Long originalProductId, DonationStatus status, int stock);

    /**
     * 특정 원본 상품 ID와 상태에 해당하는 기부 상품들을
     * 옵션(DonationOption)과 이미지(DonationImage)를 함께 조회 (fetch join)
     * - 옵션의 재고가 0보다 큰 것만 포함
     * - 중복 제거(distinct)
     * - 주로 상세 페이지나 리스트에서 한 번에 모든 관련 데이터를 가져올 때 사용
     * 
     * @param productId 원본 상품 ID
     * @param status DonationStatus enum 값
     * @return 옵션과 이미지가 포함된 기부 상품 리스트
     */
    @Query("SELECT DISTINCT dp FROM DonationProduct dp " +
           "LEFT JOIN FETCH dp.options opt " +
           "LEFT JOIN FETCH dp.images img " +
           "WHERE dp.originalProduct.id = :productId " +
           "AND dp.status = :status " +
           "AND opt.stock > 0")
    List<DonationProduct> findWithOptionsAndImagesByProductIdAndStatus(
        @Param("productId") Long productId,
        @Param("status") DonationStatus status);

    /**
     * 단일 기부 상품 ID로 옵션과 이미지 모두 fetch join하여 단건 조회 (상세페이지 단건 조회용)
     * - 옵션과 이미지 데이터가 한 번에 조회되어 성능 최적화
     * 
     * @param donationProductId 기부 상품 ID
     * @return 옵션과 이미지가 포함된 기부 상품 Optional
     */
    @Query("SELECT dp FROM DonationProduct dp " +
           "LEFT JOIN FETCH dp.options " +
           "LEFT JOIN FETCH dp.images " +
           "WHERE dp.id = :donationProductId")
    Optional<DonationProduct> findWithOptionsAndImagesById(@Param("donationProductId") Long donationProductId);

    /**
     * 카테고리 ID와 상태를 기준으로 기부 상품 리스트 조회
     * - 기부일자(donatedAt) 기준 내림차순 정렬
     * - 카테고리별로 기부 상품 목록을 보여줄 때 사용
     * 
     * @param categoryId 카테고리 ID
     * @param status DonationStatus enum 값
     * @return 조건에 맞는 기부 상품 리스트
     */
    List<DonationProduct> findByCategoryIdAndStatusOrderByDonatedAtDesc(Long categoryId, DonationStatus status);


}
