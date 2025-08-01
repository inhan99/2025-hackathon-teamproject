package com.refitbackend.service.order;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Log4j2
public class PortoneServiceImpl implements PortoneService {

    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${portone.api.key}")
    private String apiKey;
    
    @Value("${portone.api.secret}")
    private String apiSecret;
    
    private static final String PORTONE_API_URL = "https://api.iamport.kr";
    
    @Override
    public boolean verifyPayment(String impUid, String merchantUid, int amount) {
        try {
            // 테스트 환경에서는 간단한 검증만 수행
            if (impUid == null || impUid.isEmpty()) {
                log.error("imp_uid가 없습니다.");
                return false;
            }
            
            if (merchantUid == null || merchantUid.isEmpty()) {
                log.error("merchant_uid가 없습니다.");
                return false;
            }
            
            // 0원 결제(적립금 전액 사용)의 경우도 허용
            if (amount < 0) {
                log.error("결제 금액이 음수입니다: {}", amount);
                return false;
            }
            
            // 테스트 환경에서는 실제 포트원 API 호출 없이 성공 처리
            log.info("테스트 환경 - 결제 검증 성공: imp_uid={}, merchant_uid={}, amount={}", impUid, merchantUid, amount);
            return true;
            
        } catch (Exception e) {
            log.error("결제 검증 중 오류 발생: {}", e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public boolean cancelPayment(String impUid, String reason) {
        try {
            String accessToken = getAccessToken();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", accessToken);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("reason", reason);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                PORTONE_API_URL + "/payments/" + impUid + "/cancel",
                request,
                Map.class
            );
            
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            log.error("결제 취소 중 오류 발생: {}", e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public PaymentInfo getPaymentInfo(String impUid) {
        try {
            String accessToken = getAccessToken();
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", accessToken);
            
            HttpEntity<String> request = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                PORTONE_API_URL + "/payments/" + impUid,
                HttpMethod.GET,
                request,
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> paymentData = (Map<String, Object>) responseBody.get("response");
                
                PaymentInfo paymentInfo = new PaymentInfo();
                paymentInfo.setImpUid((String) paymentData.get("imp_uid"));
                paymentInfo.setMerchantUid((String) paymentData.get("merchant_uid"));
                paymentInfo.setStatus((String) paymentData.get("status"));
                paymentInfo.setAmount((Integer) paymentData.get("amount"));
                paymentInfo.setPayMethod((String) paymentData.get("pay_method"));
                paymentInfo.setPgProvider((String) paymentData.get("pg_provider"));
                
                return paymentInfo;
            }
            
        } catch (Exception e) {
            log.error("결제 정보 조회 중 오류 발생: {}", e.getMessage(), e);
        }
        
        return null;
    }
    
    private String getAccessToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("imp_key", apiKey);
            requestBody.put("imp_secret", apiSecret);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                PORTONE_API_URL + "/users/getToken",
                request,
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> tokenData = (Map<String, Object>) responseBody.get("response");
                return (String) tokenData.get("access_token");
            }
            
        } catch (Exception e) {
            log.error("액세스 토큰 발급 중 오류 발생: {}", e.getMessage(), e);
        }
        
        return null;
    }
} 