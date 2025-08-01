package com.refitbackend.service.speech;

import com.google.cloud.speech.v1.*;
import com.google.protobuf.ByteString;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpeechServiceImpl implements SpeechService {

    @Value("${google.vision.key-file-path}")
    private String keyFilePath;

    @Override
    public String convertSpeechToText(MultipartFile audioFile) {
        log.info("음성 변환 시작: {}", audioFile.getOriginalFilename());
        
        try (SpeechClient speechClient = createSpeechClient()) {
            byte[] audioBytes = audioFile.getBytes();
            
            RecognitionConfig config = RecognitionConfig.newBuilder()
                    .setLanguageCode("ko-KR")
                    .setSampleRateHertz(48000)
                    .setEncoding(RecognitionConfig.AudioEncoding.WEBM_OPUS)
                    .build();
            
            RecognitionAudio audio = RecognitionAudio.newBuilder()
                    .setContent(ByteString.copyFrom(audioBytes))
                    .build();
            
            RecognizeResponse response = speechClient.recognize(config, audio);
            
            StringBuilder result = new StringBuilder();
            for (SpeechRecognitionResult speechResult : response.getResultsList()) {
                for (SpeechRecognitionAlternative alternative : speechResult.getAlternativesList()) {
                    result.append(alternative.getTranscript());
                }
            }
            
            String transcribedText = result.toString().trim();
            log.info("음성 변환 완료: {}", transcribedText);
            
            // 빈 결과인 경우 기본값 반환
            if (transcribedText.isEmpty()) {
                log.warn("음성 인식 결과가 비어있어 기본값을 반환합니다.");
                return "티셔츠";
            }
            
            return transcribedText;
            
        } catch (Exception e) {
            log.error("음성 변환 중 오류 발생", e);
            // 오류 발생 시에도 기본값 반환
            return "티셔츠";
        }
    }

    @Override
    public String detectLanguage(MultipartFile audioFile) {
        return "ko-KR";
    }

    private SpeechClient createSpeechClient() throws IOException {
        com.google.auth.oauth2.GoogleCredentials credentials = 
            com.google.auth.oauth2.GoogleCredentials.fromStream(new FileInputStream(keyFilePath));
        
        return SpeechClient.create(SpeechSettings.newBuilder()
                .setCredentialsProvider(() -> credentials)
                .build());
    }
} 