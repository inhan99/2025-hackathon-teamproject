package com.refitbackend.repository.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.refitbackend.domain.product.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // 단건 조회 (유지)
    @EntityGraph(attributePaths = {"category", "brand", "images"})
    @Query("select p from Product p where p.id = :id")
    Optional<Product> selectOne(@Param("id") Long id);

    // 평점 높은 상품들 페이징 조회 - 카테고리 필터링 추가
    @EntityGraph(attributePaths = {"category", "brand", "images"})
    @Query("select p from Product p where p.rating >= :minRating and p.rating is not null " +
           "and (:mainCategoryId is null or p.category.id = :mainCategoryId) " +
           "and (:subCategoryId is null or p.categorySub.id = :subCategoryId) " +
           "order by p.rating desc")
    Page<Product> findByRatingGreaterThanEqualOrderByRatingDesc(
        @Param("minRating") Double minRating,
        @Param("mainCategoryId") Long mainCategoryId,
        @Param("subCategoryId") Long subCategoryId,
        Pageable pageable
    );

   // 브랜드별 상품 조회 (페이징)
   @EntityGraph(attributePaths = {"category", "brand", "images"})
   @Query("select p from Product p where p.brand.id = :brandId " +
      "and (:mainCategoryId is null or p.category.id = :mainCategoryId) " +
      "and (:subCategoryId is null or p.categorySub.id = :subCategoryId)")
   Page<Product> findByBrandId(@Param("brandId") Long brandId, 
   @Param("mainCategoryId") Long mainCategoryId,
   @Param("subCategoryId") Long subCategoryId,
   Pageable pageable);

    // 메인 카테고리별 상품 조회 (페이징)
    @EntityGraph(attributePaths = {"category", "categorySub", "brand", "images"})
    @Query("select p from Product p where p.category.id = :categoryId")
    Page<Product> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    // 서브 카테고리별 상품 조회 (페이징)
    @EntityGraph(attributePaths = {"category", "categorySub", "brand", "images"})
    @Query("select p from Product p where p.categorySub.id = :subCategoryId")
    Page<Product> findByCategorySubId(@Param("subCategoryId") Long subCategoryId, Pageable pageable);

    // 최신 등록 상품들 (ACTIVE 상태만, 페이징) - 카테고리 필터링 추가
    @EntityGraph(attributePaths = {"category", "brand", "images"})
    @Query("select p from Product p where p.status = 'ACTIVE' " +
           "and (:mainCategoryId is null or p.category.id = :mainCategoryId) " +
           "and (:subCategoryId is null or p.categorySub.id = :subCategoryId) " +
           "order by p.createdAt desc")
    Page<Product> findByStatusActiveOrderByCreatedAtDesc(
        @Param("mainCategoryId") Long mainCategoryId,
        @Param("subCategoryId") Long subCategoryId,
        Pageable pageable
    );

    // 가성비 + 고평점 (페이징) - 카테고리 필터링 추가
    @EntityGraph(attributePaths = {"category", "brand", "images"})
    @Query("select p from Product p where p.basePrice <= :maxPrice and p.rating >= :minRating " +
           "and (:mainCategoryId is null or p.category.id = :mainCategoryId) " +
           "and (:subCategoryId is null or p.categorySub.id = :subCategoryId) " +
           "order by p.rating desc")
    Page<Product> findAllAffordableHighRated(
        @Param("maxPrice") Integer maxPrice,
        @Param("minRating") Double minRating,
        @Param("mainCategoryId") Long mainCategoryId,
        @Param("subCategoryId") Long subCategoryId,
        Pageable pageable
    );

    // Vision API용: 여러 카테고리 ID로 제품 검색
    @EntityGraph(attributePaths = {"category", "categorySub", "brand", "images"})
    @Query("select p from Product p where p.category.id in :categoryIds")
    Page<Product> findByCategoryIdIn(@Param("categoryIds") List<Long> categoryIds, Pageable pageable);

    // 통합 검색: 상품명, 브랜드명, 설명에서 키워드 검색
    @EntityGraph(attributePaths = {"category", "categorySub", "brand", "images"})
    @Query("select p from Product p where " +
           "p.name like %:keyword% or " +
           "p.description like %:keyword% or " +
           "p.brand.name like %:keyword% or " +
           "p.category.name like %:keyword% or " +
           "p.categorySub.name like %:keyword%")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    // 키워드 분리 검색: 여러 키워드로 검색 (AND 조건)
    @EntityGraph(attributePaths = {"category", "categorySub", "brand", "images"})
    @Query("select p from Product p where " +
           "(:keyword1 = '' or p.name like %:keyword1% or p.description like %:keyword1% or p.brand.name like %:keyword1% or p.category.name like %:keyword1% or p.categorySub.name like %:keyword1%) and " +
           "(:keyword2 = '' or p.name like %:keyword2% or p.description like %:keyword2% or p.brand.name like %:keyword2% or p.category.name like %:keyword2% or p.categorySub.name like %:keyword2%) and " +
           "(:keyword3 = '' or p.name like %:keyword3% or p.description like %:keyword3% or p.brand.name like %:keyword3% or p.category.name like %:keyword3% or p.categorySub.name like %:keyword3%) and " +
           "(:keyword4 = '' or p.name like %:keyword4% or p.description like %:keyword4% or p.brand.name like %:keyword4% or p.category.name like %:keyword4% or p.categorySub.name like %:keyword4%) and " +
           "(:keyword5 = '' or p.name like %:keyword5% or p.description like %:keyword5% or p.brand.name like %:keyword5% or p.category.name like %:keyword5% or p.categorySub.name like %:keyword5%)")
    Page<Product> searchProductsWithMultipleKeywords(
        @Param("keyword1") String keyword1,
        @Param("keyword2") String keyword2,
        @Param("keyword3") String keyword3,
        @Param("keyword4") String keyword4,
        @Param("keyword5") String keyword5,
        Pageable pageable
    );

    // 브랜드별 검색
    @EntityGraph(attributePaths = {"category", "categorySub", "brand", "images"})
    @Query("select p from Product p where p.brand.name like %:brandName%")
    Page<Product> findByBrandNameContaining(@Param("brandName") String brandName, Pageable pageable);

    // 카테고리별 검색
    @EntityGraph(attributePaths = {"category", "categorySub", "brand", "images"})
    @Query("select p from Product p where p.category.name like %:categoryName%")
    Page<Product> findByCategoryNameContaining(@Param("categoryName") String categoryName, Pageable pageable);

    //?
    List<Product> findByIdIn(List<Long> ids);
}
