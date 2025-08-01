package com.refitbackend.controller.member;

import com.refitbackend.dto.member.BeneficiaryApplicationDTO;
import com.refitbackend.service.member.BeneficiaryApplicationService;
import com.refitbackend.service.FileStorageService;
import com.refitbackend.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/beneficiary-applications")
@RequiredArgsConstructor
@Log4j2
public class BeneficiaryApplicationController {
    
    private final BeneficiaryApplicationService applicationService;
    private final FileStorageService fileStorageService;
    private final JWTUtil jwtUtil;
    
    // 수혜자 신청
    @PostMapping
    public ResponseEntity<?> apply(@RequestParam("reason") String reason,
                                 @RequestParam("situation") String situation,
                                 @RequestParam("contactInfo") String contactInfo,
                                 @RequestParam(value = "additionalInfo", required = false) String additionalInfo,
                                 @RequestParam("documentType") String documentType,
                                 @RequestParam(value = "documentFile", required = false) MultipartFile documentFile,
                                 @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
            }
            
            String token = authorizationHeader.substring(7);
            Map<String, Object> claims = jwtUtil.validateToken(token);
            String memberEmail = (String) claims.get("email");
            
            if (memberEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
            }
            
            // 파일 업로드 처리
            String documentFileName = null;
            if (documentFile != null && !documentFile.isEmpty()) {
                documentFileName = fileStorageService.storeFile(documentFile);
            }
            
            // DTO 생성
            BeneficiaryApplicationDTO applicationDTO = BeneficiaryApplicationDTO.builder()
                    .reason(reason)
                    .situation(situation)
                    .contactInfo(contactInfo)
                    .additionalInfo(additionalInfo)
                    .documentType(documentType)
                    .documentFile(documentFileName)
                    .build();
            
            BeneficiaryApplicationDTO result = applicationService.apply(memberEmail, applicationDTO);
            return ResponseEntity.ok(result);
            
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("수혜자 신청 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류 발생");
        }
    }
    
    // 사용자별 신청 내역 조회
    @GetMapping("/my-applications")
    public ResponseEntity<List<BeneficiaryApplicationDTO>> getMyApplications(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            // Authorization 헤더가 없으면 모든 신청을 반환 (포트폴리오용)
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                List<BeneficiaryApplicationDTO> allApplications = applicationService.getPendingApplications();
                return ResponseEntity.ok(allApplications);
            }
            
            String token = authorizationHeader.substring(7);
            Map<String, Object> claims = jwtUtil.validateToken(token);
            String memberEmail = (String) claims.get("email");
            
            List<BeneficiaryApplicationDTO> applications = applicationService.getApplicationsByMember(memberEmail);
            return ResponseEntity.ok(applications);
            
        } catch (Exception e) {
            log.error("신청 내역 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // 대기중인 신청 목록 조회 (관리자용)
    @GetMapping("/pending")
    public ResponseEntity<List<BeneficiaryApplicationDTO>> getPendingApplications(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            log.info("대기중인 신청 목록 조회 시작");
            
            // Authorization 헤더가 없으면 모든 신청을 반환 (포트폴리오용)
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                log.info("Authorization 헤더 없음 - 모든 신청 반환");
                List<BeneficiaryApplicationDTO> applications = applicationService.getPendingApplications();
                log.info("조회된 신청 수: " + applications.size());
                return ResponseEntity.ok(applications);
            }
            
            String token = authorizationHeader.substring(7);
            Map<String, Object> claims = jwtUtil.validateToken(token);
            List<String> roleNames = (List<String>) claims.get("roleNames");
            
            if (roleNames == null || !roleNames.contains("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            List<BeneficiaryApplicationDTO> applications = applicationService.getPendingApplications();
            return ResponseEntity.ok(applications);
            
        } catch (Exception e) {
            log.error("대기중인 신청 목록 조회 실패", e);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // 신청 승인 (관리자용)
    @PostMapping("/{applicationId}/approve")
    public ResponseEntity<?> approveApplication(@PathVariable Long applicationId,
                                             @RequestBody Map<String, String> request,
                                             @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String token = authorizationHeader.substring(7);
            Map<String, Object> claims = jwtUtil.validateToken(token);
            List<String> roleNames = (List<String>) claims.get("roleNames");
            
            if (roleNames == null || !roleNames.contains("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            String adminComment = request.get("adminComment");
            BeneficiaryApplicationDTO result = applicationService.approveApplication(applicationId, adminComment);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("신청 승인 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류 발생");
        }
    }
    
    // 신청 거절 (관리자용)
    @PostMapping("/{applicationId}/reject")
    public ResponseEntity<?> rejectApplication(@PathVariable Long applicationId,
                                            @RequestBody Map<String, String> request,
                                            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String token = authorizationHeader.substring(7);
            Map<String, Object> claims = jwtUtil.validateToken(token);
            List<String> roleNames = (List<String>) claims.get("roleNames");
            
            if (roleNames == null || !roleNames.contains("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            String adminComment = request.get("adminComment");
            BeneficiaryApplicationDTO result = applicationService.rejectApplication(applicationId, adminComment);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("신청 거절 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류 발생");
        }
    }
    
    // 신청 가능 여부 확인
    @GetMapping("/can-apply")
    public ResponseEntity<Map<String, Boolean>> canApply(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String token = authorizationHeader.substring(7);
            Map<String, Object> claims = jwtUtil.validateToken(token);
            String memberEmail = (String) claims.get("email");
            
            boolean canApply = !applicationService.hasPendingApplication(memberEmail);
            return ResponseEntity.ok(Map.of("canApply", canApply));
            
        } catch (Exception e) {
            log.error("신청 가능 여부 확인 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 