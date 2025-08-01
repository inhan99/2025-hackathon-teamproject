package com.refitbackend.controller.vision;

import com.refitbackend.dto.vision.VisionAnalysisResponseDTO;
import com.refitbackend.service.vision.VisionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/vision")
@RequiredArgsConstructor
public class VisionController {

    private final VisionService visionService;

    /**
     * 옷 이미지 분석 및 관련 제품 검색
     */
    @PostMapping("/analyze-clothing")
    public ResponseEntity<VisionAnalysisResponseDTO> analyzeClothingImage(
            @RequestParam("image") MultipartFile imageFile) {
        
        try {
            log.info("옷 이미지 분석 요청: {}", imageFile.getOriginalFilename());
            
            VisionAnalysisResponseDTO result = visionService.analyzeClothingImage(imageFile);
            
            log.info("이미지 분석 완료: {}개의 라벨, {}개의 관련 제품", 
                    result.getLabels().size(), result.getRelatedProducts().size());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("이미지 분석 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 이미지에서 텍스트 추출
     */
    @PostMapping("/extract-text")
    public ResponseEntity<String> extractTextFromImage(
            @RequestParam("image") MultipartFile imageFile) {
        
        try {
            log.info("텍스트 추출 요청: {}", imageFile.getOriginalFilename());
            
            String extractedText = visionService.extractTextFromImage(imageFile);
            
            log.info("텍스트 추출 완료: {}", extractedText);
            
            return ResponseEntity.ok(extractedText);
            
        } catch (Exception e) {
            log.error("텍스트 추출 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }
} 