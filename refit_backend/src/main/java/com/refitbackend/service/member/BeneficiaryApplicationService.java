package com.refitbackend.service.member;

import com.refitbackend.dto.member.BeneficiaryApplicationDTO;

import java.util.List;

public interface BeneficiaryApplicationService {
    
    // 수혜자 신청
    BeneficiaryApplicationDTO apply(String memberEmail, BeneficiaryApplicationDTO applicationDTO);
    
    // 사용자별 신청 내역 조회
    List<BeneficiaryApplicationDTO> getApplicationsByMember(String memberEmail);
    
    // 대기중인 신청 목록 조회 (관리자용)
    List<BeneficiaryApplicationDTO> getPendingApplications();
    
    // 신청 승인 (관리자용)
    BeneficiaryApplicationDTO approveApplication(Long applicationId, String adminComment);
    
    // 신청 거절 (관리자용)
    BeneficiaryApplicationDTO rejectApplication(Long applicationId, String adminComment);
    
    // 사용자가 이미 신청했는지 확인
    boolean hasPendingApplication(String memberEmail);
} 