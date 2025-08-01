package com.refitbackend.service.product;

import com.refitbackend.domain.product.Product;
import com.refitbackend.dto.product.ProductImageDTO;
import com.refitbackend.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.Comparator;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final ProductRepository productRepository;
    private final ProductImageService productImageService;

    // 키워드 동의어 매핑
    private static final Map<String, List<String>> KEYWORD_SYNONYMS = new HashMap<>();
    
    static {
        KEYWORD_SYNONYMS.put("검은색", Arrays.asList("블랙", "black", "검정", "검정색"));
        KEYWORD_SYNONYMS.put("흰색", Arrays.asList("화이트", "white", "흰", "흰색"));
        KEYWORD_SYNONYMS.put("빨간색", Arrays.asList("레드", "red", "빨강", "빨간"));
        KEYWORD_SYNONYMS.put("파란색", Arrays.asList("블루", "blue", "파랑", "파란"));
        KEYWORD_SYNONYMS.put("티셔츠", Arrays.asList("티", "t-shirt", "tshirt", "티셔트"));
        KEYWORD_SYNONYMS.put("셔츠", Arrays.asList("shirt", "남방", "남성셔츠"));
        KEYWORD_SYNONYMS.put("바지", Arrays.asList("팬츠", "pants", "트라우저", "trousers"));
        KEYWORD_SYNONYMS.put("치마", Arrays.asList("skirt", "스커트"));
        KEYWORD_SYNONYMS.put("원피스", Arrays.asList("dress", "드레스"));
        KEYWORD_SYNONYMS.put("후드", Arrays.asList("hoodie", "후드티", "후드티셔츠"));
        KEYWORD_SYNONYMS.put("니트", Arrays.asList("knit", "스웨터", "sweater"));
        KEYWORD_SYNONYMS.put("코트", Arrays.asList("coat", "외투", "재킷", "jacket"));
    }

    @Override
    public List<ProductImageDTO> searchProducts(String keyword, Pageable pageable) {
        log.info("통합 검색 실행: {}", keyword);
        
        if (keyword == null || keyword.trim().isEmpty()) {
            log.info("검색어가 비어있어 빈 리스트 반환");
            return List.of();
        }
        
        // 키워드 분리
        List<String> keywords = splitKeywords(keyword.trim());
        log.info("원본 키워드: '{}'", keyword);
        log.info("분리된 키워드: {}", keywords);
        
        // 키워드가 1개면 기존 방식 사용, 여러 개면 새로운 방식 사용
        if (keywords.size() == 1) {
            return searchProductsWithSingleKeyword(keywords.get(0), pageable);
        } else {
            return searchProductsWithKeywords(keywords, pageable);
        }
    }

    /**
     * 키워드 분리 - 띄어쓰기 기준으로 단어 분리, 하이픈 처리 추가
     */
    private List<String> splitKeywords(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        
        // 하이픈을 공백으로 변환하여 처리
        String processedKeyword = keyword.replace("-", " ");
        
        return Arrays.stream(processedKeyword.split("\\s+"))
                .filter(k -> !k.trim().isEmpty())
                .map(String::trim)
                .collect(Collectors.toList());
    }

    /**
     * 키워드의 동의어 목록 반환
     */
    private List<String> getSynonyms(String keyword) {
        for (Map.Entry<String, List<String>> entry : KEYWORD_SYNONYMS.entrySet()) {
            if (keyword.equals(entry.getKey()) || entry.getKey().equals(keyword)) {
                return entry.getValue();
            }
        }
        return List.of(keyword); // 동의어가 없으면 원본 키워드만 반환
    }

    /**
     * 단일 키워드로 검색 (기존 방식 + 하이픈 처리)
     */
    private List<ProductImageDTO> searchProductsWithSingleKeyword(String keyword, Pageable pageable) {
        log.info("단일 키워드 검색 시작: '{}'", keyword);
        
        // 1. 원본 키워드로 검색
        Page<Product> productPage = productRepository.searchProducts(keyword, pageable);
        log.info("원본 키워드 검색 결과: {}개 상품 발견", productPage.getTotalElements());
        
        if (productPage.getTotalElements() > 0) {
            return convertToProductImageDTO(productPage.getContent());
        }
        
        // 2. 하이픈이 포함된 경우 하이픈 제거 후 검색
        if (keyword.contains("-")) {
            String cleanKeyword = keyword.replace("-", " ").trim();
            log.info("하이픈 제거 후 검색: '{}'", cleanKeyword);
            
            productPage = productRepository.searchProducts(cleanKeyword, pageable);
            log.info("하이픈 제거 검색 결과: {}개 상품 발견", productPage.getTotalElements());
            
            if (productPage.getTotalElements() > 0) {
                return convertToProductImageDTO(productPage.getContent());
            }
        }
        
        // 3. 키워드가 여러 단어로 구성된 경우 부분 매칭 시도
        String[] words = keyword.split("\\s+");
        if (words.length > 1) {
            // 가장 긴 단어로 검색
            String longestWord = Arrays.stream(words)
                    .max(Comparator.comparing(String::length))
                    .orElse(keyword);
            
            log.info("부분 매칭 검색 (가장 긴 단어): '{}'", longestWord);
            productPage = productRepository.searchProducts(longestWord, pageable);
            log.info("부분 매칭 검색 결과: {}개 상품 발견", productPage.getTotalElements());
            
            if (productPage.getTotalElements() > 0) {
                return convertToProductImageDTO(productPage.getContent());
            }
        }
        
        log.info("검색 실패: '{}'에 대한 결과 없음", keyword);
        return List.of();
    }

    @Override
    public List<ProductImageDTO> searchProductsWithKeywords(List<String> keywords, Pageable pageable) {
        log.info("다중 키워드 검색 실행: {}", keywords);
        
        if (keywords == null || keywords.isEmpty()) {
            return List.of();
        }
        
        // 키워드가 2개 이하인 경우 기존 AND 로직 사용
        if (keywords.size() <= 2) {
            return searchProductsWithKeywordsAND(keywords, pageable);
        }
        
        // 키워드가 3개 이상인 경우 OR 로직 사용 (더 유연한 검색)
        return searchProductsWithKeywordsOR(keywords, pageable);
    }
    
    /**
     * AND 조건으로 다중 키워드 검색 (기존 로직)
     */
    private List<ProductImageDTO> searchProductsWithKeywordsAND(List<String> keywords, Pageable pageable) {
        log.info("AND 조건 다중 키워드 검색 실행: {}", keywords);
        
        // 각 키워드별로 동의어를 포함한 검색 후 교집합 찾기
        Set<Long> commonProductIds = null;
        
        for (String keyword : keywords) {
            if (keyword != null && !keyword.trim().isEmpty()) {
                // 키워드의 동의어 목록 가져오기
                List<String> synonyms = getSynonyms(keyword.trim());
                log.info("키워드 '{}'의 동의어: {}", keyword, synonyms);
                
                Set<Long> currentProductIds = new HashSet<>();
                
                // 각 동의어로 검색
                for (String synonym : synonyms) {
                    try {
                        Page<Product> productPage = productRepository.searchProducts(synonym, Pageable.unpaged());
                        List<Product> products = productPage.getContent();
                        currentProductIds.addAll(products.stream()
                                .map(Product::getId)
                                .collect(Collectors.toSet()));
                        log.info("동의어 '{}' 검색 결과: {}개 상품", synonym, products.size());
                    } catch (Exception e) {
                        log.error("동의어 '{}' 검색 중 오류: {}", synonym, e.getMessage());
                    }
                }
                
                if (commonProductIds == null) {
                    // 첫 번째 키워드의 결과로 초기화
                    commonProductIds = currentProductIds;
                    log.info("첫 번째 키워드 '{}' 검색 결과: {}개 상품", keyword, currentProductIds.size());
                } else {
                    // 교집합 계산 (AND 조건)
                    int beforeSize = commonProductIds.size();
                    commonProductIds.retainAll(currentProductIds);
                    log.info("키워드 '{}' 추가 후 교집합: {}개 -> {}개 상품", keyword, beforeSize, commonProductIds.size());
                }
            }
        }
        
        // 교집합 결과로 최종 상품 조회 (페이징 적용)
        List<ProductImageDTO> finalResults = new ArrayList<>();
        if (commonProductIds != null && !commonProductIds.isEmpty()) {
            // 페이징을 위해 전체 ID 목록을 페이지 단위로 분할
            List<Long> allIds = new ArrayList<>(commonProductIds);
            int pageSize = pageable.getPageSize();
            int pageNumber = pageable.getPageNumber();
            int startIndex = pageNumber * pageSize;
            int endIndex = Math.min(startIndex + pageSize, allIds.size());
            
            log.info("페이징 정보: 전체 {}개, 페이지 {}, 시작 {}, 끝 {}", 
                    allIds.size(), pageNumber, startIndex, endIndex);
            
            if (startIndex < allIds.size()) {
                List<Long> pageIds = allIds.subList(startIndex, endIndex);
                log.info("현재 페이지 상품 ID: {}", pageIds);
                List<Product> finalProducts = productRepository.findByIdIn(pageIds);
                finalResults = convertToProductImageDTO(finalProducts);
            }
        } else {
            log.info("교집합 결과가 비어있음: commonProductIds={}", commonProductIds);
        }
        
        log.info("AND 조건 다중 키워드 검색 결과: {}개 상품 발견", finalResults.size());
        return finalResults;
    }
    
    /**
     * OR 조건으로 다중 키워드 검색 (새로운 로직)
     */
    private List<ProductImageDTO> searchProductsWithKeywordsOR(List<String> keywords, Pageable pageable) {
        log.info("OR 조건 다중 키워드 검색 실행: {}", keywords);
        
        // 각 키워드별로 검색 결과를 수집
        Map<Long, Integer> productScoreMap = new HashMap<>(); // 상품ID -> 매칭 점수
        
        for (String keyword : keywords) {
            if (keyword != null && !keyword.trim().isEmpty()) {
                // 키워드의 동의어 목록 가져오기
                List<String> synonyms = getSynonyms(keyword.trim());
                log.info("키워드 '{}'의 동의어: {}", keyword, synonyms);
                
                // 각 동의어로 검색
                for (String synonym : synonyms) {
                    try {
                        Page<Product> productPage = productRepository.searchProducts(synonym, Pageable.unpaged());
                        List<Product> products = productPage.getContent();
                        
                        // 매칭 점수 계산 (더 많은 키워드가 매칭될수록 높은 점수)
                        for (Product product : products) {
                            Long productId = product.getId();
                            int currentScore = productScoreMap.getOrDefault(productId, 0);
                            
                            // 상품명에 키워드가 포함된 경우 더 높은 점수
                            String productName = product.getName().toLowerCase();
                            String searchKeyword = synonym.toLowerCase();
                            
                            if (productName.contains(searchKeyword)) {
                                currentScore += 10; // 키워드 매칭
                                
                                // 정확한 매칭인 경우 추가 점수
                                if (productName.equals(searchKeyword)) {
                                    currentScore += 5;
                                }
                                
                                // 키워드가 상품명의 시작 부분에 있는 경우 추가 점수
                                if (productName.startsWith(searchKeyword)) {
                                    currentScore += 3;
                                }
                            }
                            
                            productScoreMap.put(productId, currentScore);
                        }
                        
                        log.info("동의어 '{}' 검색 결과: {}개 상품", synonym, products.size());
                    } catch (Exception e) {
                        log.error("동의어 '{}' 검색 중 오류: {}", synonym, e.getMessage());
                    }
                }
            }
        }
        
        // 점수별로 정렬
        List<Long> sortedProductIds = productScoreMap.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        log.info("OR 조건 검색 결과: {}개 상품, 점수 분포: {}", 
                sortedProductIds.size(), productScoreMap.values().stream().distinct().sorted().collect(Collectors.toList()));
        
        // 페이징 적용
        List<ProductImageDTO> finalResults = new ArrayList<>();
        if (!sortedProductIds.isEmpty()) {
            int pageSize = pageable.getPageSize();
            int pageNumber = pageable.getPageNumber();
            int startIndex = pageNumber * pageSize;
            int endIndex = Math.min(startIndex + pageSize, sortedProductIds.size());
            
            if (startIndex < sortedProductIds.size()) {
                List<Long> pageIds = sortedProductIds.subList(startIndex, endIndex);
                List<Product> finalProducts = productRepository.findByIdIn(pageIds);
                finalResults = convertToProductImageDTO(finalProducts);
            }
        }
        
        log.info("OR 조건 다중 키워드 검색 결과: {}개 상품 발견", finalResults.size());
        return finalResults;
    }

    /**
     * Product 리스트를 ProductImageDTO로 변환
     */
    private List<ProductImageDTO> convertToProductImageDTO(List<Product> products) {
        if (products.isEmpty()) {
            return List.of();
        }
        
        // 상품 ID 목록 추출
        List<Long> productIds = products.stream()
                .map(Product::getId)
                .collect(Collectors.toList());
        
        // 한 번에 모든 이미지 조회
        Map<Long, List<ProductImageDTO>> imagesMap = productImageService.getByProductIds(productIds);
        
        return products.stream()
                .flatMap(product -> {
                    List<ProductImageDTO> images = imagesMap.getOrDefault(product.getId(), List.of());
                    if (images.isEmpty()) {
                        // 이미지가 없는 경우 기본 이미지 생성
                        ProductImageDTO defaultImage = ProductImageDTO.builder()
                                .id(0L)
                                .productId(product.getId())
                                .url("/images/" + product.getId() + ".jpg")
                                .urlThumbnail("/thumbs/" + product.getId() + "_thumbnail.jpg")
                                .altText(product.getName())
                                .imageOrder(1)
                                .isThumbnail(true)
                                .build();
                        return List.of(defaultImage).stream();
                    }
                    return images.stream();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductImageDTO> searchByBrand(String brandName, Pageable pageable) {
        log.info("브랜드 검색 실행: {}", brandName);
        
        if (brandName == null || brandName.trim().isEmpty()) {
            return List.of();
        }
        
        Page<Product> productPage = productRepository.findByBrandNameContaining(brandName.trim(), pageable);
        log.info("브랜드 검색 결과: {}개 상품 발견", productPage.getTotalElements());
        
        List<Product> products = productPage.getContent();
        if (products.isEmpty()) {
            return List.of();
        }
        
        // 상품 ID 목록 추출
        List<Long> productIds = products.stream()
                .map(Product::getId)
                .collect(Collectors.toList());
        
        // 한 번에 모든 이미지 조회
        Map<Long, List<ProductImageDTO>> imagesMap = productImageService.getByProductIds(productIds);
        
        return products.stream()
                .flatMap(product -> imagesMap.getOrDefault(product.getId(), List.of()).stream())
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductImageDTO> searchByCategory(String categoryName, Pageable pageable) {
        log.info("카테고리 검색 실행: {}", categoryName);
        
        if (categoryName == null || categoryName.trim().isEmpty()) {
            return List.of();
        }
        
        Page<Product> productPage = productRepository.findByCategoryNameContaining(categoryName.trim(), pageable);
        log.info("카테고리 검색 결과: {}개 상품 발견", productPage.getTotalElements());
        
        List<Product> products = productPage.getContent();
        if (products.isEmpty()) {
            return List.of();
        }
        
        // 상품 ID 목록 추출
        List<Long> productIds = products.stream()
                .map(Product::getId)
                .collect(Collectors.toList());
        
        // 한 번에 모든 이미지 조회
        Map<Long, List<ProductImageDTO>> imagesMap = productImageService.getByProductIds(productIds);
        
        return products.stream()
                .flatMap(product -> imagesMap.getOrDefault(product.getId(), List.of()).stream())
                .collect(Collectors.toList());
    }

    @Override
    public long getSearchResultCount(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return 0;
        }
        
        // 키워드 분리
        List<String> keywords = splitKeywords(keyword.trim());
        
        // 키워드가 1개면 기존 방식 사용, 여러 개면 새로운 방식 사용
        if (keywords.size() == 1) {
            Page<Product> productPage = productRepository.searchProducts(keywords.get(0), Pageable.unpaged());
            return productPage.getTotalElements();
        } else {
            return getSearchResultCountWithKeywords(keywords);
        }
    }

    @Override
    public long getSearchResultCountWithKeywords(List<String> keywords) {
        if (keywords == null || keywords.isEmpty()) {
            return 0;
        }
        
        // 각 키워드별로 동의어를 포함한 검색 후 교집합 찾기 (페이징 없이)
        Set<Long> commonProductIds = null;
        
        for (String keyword : keywords) {
            if (keyword != null && !keyword.trim().isEmpty()) {
                // 키워드의 동의어 목록 가져오기
                List<String> synonyms = getSynonyms(keyword.trim());
                log.info("개수 계산 - 키워드 '{}'의 동의어: {}", keyword, synonyms);
                
                Set<Long> currentProductIds = new HashSet<>();
                
                // 각 동의어로 검색
                for (String synonym : synonyms) {
                    try {
                        Page<Product> productPage = productRepository.searchProducts(synonym, Pageable.unpaged());
                        List<Product> products = productPage.getContent();
                        currentProductIds.addAll(products.stream()
                                .map(Product::getId)
                                .collect(Collectors.toSet()));
                        log.info("개수 계산 - 동의어 '{}' 검색 결과: {}개 상품", synonym, products.size());
                    } catch (Exception e) {
                        log.error("동의어 '{}' 검색 중 오류: {}", synonym, e.getMessage());
                    }
                }
                
                if (commonProductIds == null) {
                    // 첫 번째 키워드의 결과로 초기화
                    commonProductIds = currentProductIds;
                    log.info("개수 계산 - 첫 번째 키워드 '{}' 검색 결과: {}개 상품", keyword, currentProductIds.size());
                } else {
                    // 교집합 계산 (AND 조건)
                    int beforeSize = commonProductIds.size();
                    commonProductIds.retainAll(currentProductIds);
                    log.info("개수 계산 - 키워드 '{}' 추가 후 교집합: {}개 -> {}개 상품", keyword, beforeSize, commonProductIds.size());
                }
            }
        }
        
        long totalCount = commonProductIds != null ? commonProductIds.size() : 0;
        log.info("다중 키워드 검색 총 개수: {}", totalCount);
        return totalCount;
    }
} 