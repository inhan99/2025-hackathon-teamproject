package com.refitbackend.service.vision;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import com.refitbackend.domain.product.CategorySub;
import com.refitbackend.domain.product.Product;
import com.refitbackend.dto.vision.VisionAnalysisResponseDTO;
import com.refitbackend.repository.product.CategorySubRepository;
import com.refitbackend.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VisionServiceImpl implements VisionService {

    @Value("${google.vision.key-file-path}")
    private String keyFilePath;

    private final ProductRepository productRepository;
    private final CategorySubRepository categorySubRepository;

    // 인식할 서브카테고리 키워드
    private static final Map<String, Set<String>> SUB_CATEGORY_KEYWORDS = Map.of(
        "반팔", Set.of("short sleeve", "t-shirt", "tshirt", "반팔", "반팔티", "반팔티셔츠", "sleeveless", "tank top", "탱크탑", "민소매", "tee", "티셔츠", "top"),
        "긴팔", Set.of("long sleeve", "긴팔", "긴팔티", "긴팔티셔츠", "longsleeve", "sweater", "스웨터", "니트", "knit", "셔츠", "shirt"),
        "아우터", Set.of("jacket", "coat", "아우터", "재킷", "코트", "패딩", "padding", "hoodie", "후드", "후드티", "cardigan", "가디건", "blazer", "블레이저", "outerwear", "outer", "점퍼", "jumper"),
        "반바지", Set.of("shorts", "반바지", "숏팬츠", "short pants"),
        "긴바지", Set.of("pants", "jeans", "긴바지", "긴팬츠", "long pants", "바지", "청바지", "leggings", "레깅스", "slacks", "슬랙스", "trousers", "팬츠"),
        "치마", Set.of("skirt", "치마", "스커트", "미니스커트", "롱스커트", "플리츠")
    );

    // 제외할 키워드
    private static final Set<String> EXCLUDE_KEYWORDS = Set.of(
        "pregnant", "maternity", "임산", "임신", "임산복", "임신복",
        "baby", "child", "kid", "infant", "toddler", "아동", "유아", "아기", "어린이",
        "children", "kids", "baby clothes", "child clothes", "아동복", "유아복"
    );

    @Override
    public VisionAnalysisResponseDTO analyzeClothingImage(MultipartFile imageFile) {
        try {
            log.info("이미지 분석 시작");
            
            // 1. Vision API로 이미지 분석
            List<VisionAnalysisResponseDTO.VisionLabelDTO> labels = analyzeImageWithVisionAPI(imageFile);
            String extractedText = extractTextWithVisionAPI(imageFile);
            
            log.info("Vision API 라벨: {}", labels.stream().map(VisionAnalysisResponseDTO.VisionLabelDTO::getDescription).collect(Collectors.toList()));
            log.info("추출된 텍스트: {}", extractedText);
            
            // 2. 서브카테고리 감지
            String detectedSubCategory = detectSubCategory(labels, extractedText);
            log.info("감지된 서브카테고리: {}", detectedSubCategory);
            
            // 3. 제외 키워드 확인
            if (isExcluded(labels, extractedText)) {
                log.info("임산복 또는 아동복이 감지되어 검색을 제한합니다.");
                return createExcludedResponse(labels, extractedText);
            }
            
            // 4. 상품 검색
            List<VisionAnalysisResponseDTO.VisionProductDTO> products = findProductsBySubCategory(detectedSubCategory);
            log.info("검색된 상품 수: {}", products.size());

            return VisionAnalysisResponseDTO.builder()
                    .labels(labels)
                    .extractedText(extractedText)
                    .relatedProducts(products)
                    .clothingType(detectedSubCategory != null ? detectedSubCategory : "분류 안됨")
                    .build();
                    
        } catch (Exception e) {
            log.error("이미지 분석 중 오류 발생", e);
            throw new RuntimeException("이미지 분석에 실패했습니다: " + e.getMessage());
        }
    }

    @Override
    public String extractTextFromImage(MultipartFile imageFile) {
        try {
            return extractTextWithVisionAPI(imageFile);
        } catch (Exception e) {
            log.error("텍스트 추출 중 오류 발생", e);
            return "";
        }
    }

    private List<VisionAnalysisResponseDTO.VisionLabelDTO> analyzeImageWithVisionAPI(MultipartFile imageFile) throws IOException {
        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(keyFilePath));
        ImageAnnotatorSettings settings = ImageAnnotatorSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials)).build();

        try (ImageAnnotatorClient client = ImageAnnotatorClient.create(settings)) {
            ByteString imgBytes = ByteString.copyFrom(imageFile.getBytes());
            Image img = Image.newBuilder().setContent(imgBytes).build();
            Feature feat = Feature.newBuilder().setType(Feature.Type.OBJECT_LOCALIZATION).build();
            AnnotateImageRequest request = AnnotateImageRequest.newBuilder().addFeatures(feat).setImage(img).build();

            BatchAnnotateImagesResponse response = client.batchAnnotateImages(Collections.singletonList(request));
            List<VisionAnalysisResponseDTO.VisionLabelDTO> labels = new ArrayList<>();

            for (AnnotateImageResponse res : response.getResponsesList()) {
                if (res.hasError()) {
                    log.error("Vision API 오류: {}", res.getError().getMessage());
                    throw new IOException("Vision API Error: " + res.getError().getMessage());
                }
                for (LocalizedObjectAnnotation annotation : res.getLocalizedObjectAnnotationsList()) {
                    labels.add(VisionAnalysisResponseDTO.VisionLabelDTO.builder()
                            .description(annotation.getName())
                            .score((double) annotation.getScore())
                            .build());
                }
            }
            return labels;
        }
    }

    private String extractTextWithVisionAPI(MultipartFile imageFile) throws IOException {
        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(keyFilePath));
        ImageAnnotatorSettings settings = ImageAnnotatorSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials)).build();

        try (ImageAnnotatorClient client = ImageAnnotatorClient.create(settings)) {
            ByteString imgBytes = ByteString.copyFrom(imageFile.getBytes());
            Image img = Image.newBuilder().setContent(imgBytes).build();
            Feature feat = Feature.newBuilder().setType(Feature.Type.TEXT_DETECTION).build();
            AnnotateImageRequest request = AnnotateImageRequest.newBuilder().addFeatures(feat).setImage(img).build();

            BatchAnnotateImagesResponse response = client.batchAnnotateImages(Collections.singletonList(request));

            if (!response.getResponsesList().isEmpty()) {
                AnnotateImageResponse res = response.getResponsesList().get(0);
                if (res.hasError()) {
                    log.error("Vision API 텍스트 추출 오류: {}", res.getError().getMessage());
                    throw new IOException("Vision API text extraction error: " + res.getError().getMessage());
                }
                return res.getFullTextAnnotation().getText();
            }
            return "";
        }
    }

    private String detectSubCategory(List<VisionAnalysisResponseDTO.VisionLabelDTO> labels, String extractedText) {
        // 전체 텍스트 생성
        String allText = extractedText.toLowerCase();
        for (VisionAnalysisResponseDTO.VisionLabelDTO label : labels) {
            allText += " " + label.getDescription().toLowerCase();
        }
        
        log.info("검색할 전체 텍스트: {}", allText);
        
        // 가장 높은 점수를 가진 서브카테고리 찾기
        String bestSubCategory = null;
        double bestScore = 0.0;
        
        for (Map.Entry<String, Set<String>> entry : SUB_CATEGORY_KEYWORDS.entrySet()) {
            String subCategory = entry.getKey();
            Set<String> keywords = entry.getValue();
            
            double score = 0.0;
            for (String keyword : keywords) {
                if (allText.contains(keyword.toLowerCase())) {
                    score += 1.0;
                    log.info("키워드 매칭: {} -> {}", keyword, subCategory);
                }
            }
            
            log.info("서브카테고리 {} 점수: {}", subCategory, score);
            
            if (score > bestScore) {
                bestScore = score;
                bestSubCategory = subCategory;
            }
        }
        
        log.info("최종 선택된 서브카테고리: {} (점수: {})", bestSubCategory, bestScore);
        return bestSubCategory;
    }

    private boolean isExcluded(List<VisionAnalysisResponseDTO.VisionLabelDTO> labels, String extractedText) {
        String allText = extractedText.toLowerCase();
        for (VisionAnalysisResponseDTO.VisionLabelDTO label : labels) {
            allText += " " + label.getDescription().toLowerCase();
        }
        
        for (String excludeKeyword : EXCLUDE_KEYWORDS) {
            if (allText.contains(excludeKeyword.toLowerCase())) {
                log.info("제외 키워드 발견: {}", excludeKeyword);
                return true;
            }
        }
        return false;
    }

    private List<VisionAnalysisResponseDTO.VisionProductDTO> findProductsBySubCategory(String subCategory) {
        if (subCategory == null) {
            log.info("서브카테고리가 null이므로 빈 리스트 반환");
            return new ArrayList<>();
        }
        
        log.info("서브카테고리 검색: {}", subCategory);
        
        // 정확한 이름으로 서브카테고리 검색
        List<CategorySub> matchingSubCategories = categorySubRepository.findAll().stream()
                .filter(subCat -> subCat.getName().equals(subCategory))
                .filter(subCat -> {
                    String categoryName = subCat.getCategory().getName();
                    return !categoryName.contains("임산") && !categoryName.contains("아동") && 
                           !categoryName.contains("유아") && !categoryName.contains("베이비");
                })
                .collect(Collectors.toList());
        
        log.info("매칭된 서브카테고리 수: {}", matchingSubCategories.size());
        
        if (matchingSubCategories.isEmpty()) {
            log.info("매칭된 서브카테고리가 없음");
            return new ArrayList<>();
        }
        
        List<VisionAnalysisResponseDTO.VisionProductDTO> products = new ArrayList<>();
        
        for (CategorySub subCat : matchingSubCategories) {
            Page<Product> productPage = productRepository.findByCategorySubId(subCat.getId(), PageRequest.of(0, 10));
            log.info("서브카테고리 {}에서 {}개의 상품 발견", subCat.getName(), productPage.getTotalElements());
            
            for (Product product : productPage.getContent()) {
                products.add(createVisionProductDTO(product));
            }
        }
        
        log.info("최종 반환할 상품 수: {}", products.size());
        return products.stream().limit(10).collect(Collectors.toList());
    }

    private VisionAnalysisResponseDTO createExcludedResponse(List<VisionAnalysisResponseDTO.VisionLabelDTO> labels, String extractedText) {
        return VisionAnalysisResponseDTO.builder()
                .labels(labels)
                .extractedText(extractedText)
                .relatedProducts(new ArrayList<>())
                .clothingType("임산복/아동복 - 검색 제한")
                .build();
    }

    private VisionAnalysisResponseDTO.VisionProductDTO createVisionProductDTO(Product product) {
        return VisionAnalysisResponseDTO.VisionProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySubName(product.getCategorySub() != null ? product.getCategorySub().getName() : null)
                .rating(product.getRating())
                .mainImageUrl("/images/" + product.getId() + ".jpg")
                .relevanceScore(0.5) // 기본 점수
                .build();
    }
} 