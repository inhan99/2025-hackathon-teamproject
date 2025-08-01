package com.refitbackend.domain.member;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
public class BeneficiaryApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_email")
    private Member member;
    
    private String reason; // 신청 사유
    private String situation; // 현재 상황
    private String contactInfo; // 연락처
    private String additionalInfo; // 추가 정보
    private String documentType; // 서류 유형 (BASIC_LIFE, SINGLE_PARENT, WELFARE_RECOMMEND)
    private String documentFile; // 서류 파일명
    
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status; // PENDING, APPROVED, REJECTED
    
    private LocalDateTime appliedAt; // 신청일
    private LocalDateTime processedAt; // 처리일
    private String adminComment; // 관리자 코멘트
    
    public enum ApplicationStatus {
        PENDING, APPROVED, REJECTED
    }
    
    public void approve(String adminComment) {
        this.status = ApplicationStatus.APPROVED;
        this.processedAt = LocalDateTime.now();
        this.adminComment = adminComment;
    }
    
    public void reject(String adminComment) {
        this.status = ApplicationStatus.REJECTED;
        this.processedAt = LocalDateTime.now();
        this.adminComment = adminComment;
    }
} 