package com.refitbackend.service.vision;

import com.refitbackend.dto.vision.VisionAnalysisResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface VisionService {
    
    /**
     * 이미지에서 옷 종류를 분석하고 관련 제품을 검색
     */
    VisionAnalysisResponseDTO analyzeClothingImage(MultipartFile imageFile);
    
    /**
     * 이미지에서 텍스트를 추출
     */
    String extractTextFromImage(MultipartFile imageFile);
} 