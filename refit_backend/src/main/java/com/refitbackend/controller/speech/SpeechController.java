package com.refitbackend.controller.speech;

import com.refitbackend.service.speech.SpeechService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/speech")
@RequiredArgsConstructor
public class SpeechController {

    private final SpeechService speechService;

    /**
     * 음성 파일을 텍스트로 변환
     */
    @PostMapping("/convert-to-text")
    public ResponseEntity<Map<String, Object>> convertSpeechToText(
            @RequestParam("audio") MultipartFile audioFile) {
        
        try {
            log.info("음성 변환 요청: {}", audioFile.getOriginalFilename());
            
            // 파일 크기 체크 (10MB 제한)
            if (audioFile.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "음성 파일 크기는 10MB 이하여야 합니다."));
            }
            
            // 파일 타입 체크
            String contentType = audioFile.getContentType();
            if (contentType == null || !contentType.startsWith("audio/")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "음성 파일만 업로드 가능합니다."));
            }
            
            // 음성을 텍스트로 변환
            String transcribedText = speechService.convertSpeechToText(audioFile);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "text", transcribedText,
                "originalFilename", audioFile.getOriginalFilename()
            );
            
            log.info("음성 변환 완료: {}", transcribedText);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("음성 변환 중 오류 발생", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "음성 변환에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 음성 검색 - 음성을 텍스트로 변환 후 검색 결과 반환
     */
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> speechSearch(
            @RequestParam("audio") MultipartFile audioFile) {
        
        try {
            log.info("음성 검색 요청: {}", audioFile.getOriginalFilename());
            
            // 음성을 텍스트로 변환
            String searchKeyword = speechService.convertSpeechToText(audioFile);
            
            // 빈 문자열인 경우 기본값 사용
            if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
                log.warn("음성 인식 결과가 비어있어 기본값을 사용합니다.");
                searchKeyword = "티셔츠";
            }
            
            Map<String, Object> response = Map.of(
                "success", true,
                "keyword", searchKeyword.trim(),
                "message", "음성 검색이 완료되었습니다."
            );
            
            log.info("음성 검색 완료: {}", searchKeyword);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("음성 검색 중 오류 발생", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "음성 검색에 실패했습니다: " + e.getMessage()));
        }
    }
} 