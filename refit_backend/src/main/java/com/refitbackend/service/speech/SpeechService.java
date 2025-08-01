package com.refitbackend.service.speech;

import org.springframework.web.multipart.MultipartFile;

public interface SpeechService {
    
    /**
     * 음성 파일을 텍스트로 변환
     */
    String convertSpeechToText(MultipartFile audioFile);
    
    /**
     * 음성 파일의 언어 감지
     */
    String detectLanguage(MultipartFile audioFile);
} 