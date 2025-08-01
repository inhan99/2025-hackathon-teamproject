package com.refitbackend.repository.member;

import com.refitbackend.domain.member.BeneficiaryApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BeneficiaryApplicationRepository extends JpaRepository<BeneficiaryApplication, Long> {
    
    // 사용자별 신청 내역 조회
    List<BeneficiaryApplication> findByMemberEmailOrderByAppliedAtDesc(String memberEmail);
    
    // 대기중인 신청만 조회
    List<BeneficiaryApplication> findByStatusOrderByAppliedAtDesc(BeneficiaryApplication.ApplicationStatus status);
    
    // 사용자의 최신 신청 조회
    Optional<BeneficiaryApplication> findTopByMemberEmailOrderByAppliedAtDesc(String memberEmail);
    
    // 사용자가 이미 신청했는지 확인 (대기중인 신청이 있는지)
    boolean existsByMemberEmailAndStatus(String memberEmail, BeneficiaryApplication.ApplicationStatus status);
} 