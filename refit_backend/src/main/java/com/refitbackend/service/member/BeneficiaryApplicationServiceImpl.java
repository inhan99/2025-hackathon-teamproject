package com.refitbackend.service.member;

import com.refitbackend.domain.member.BeneficiaryApplication;
import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.member.MemberRole;
import com.refitbackend.dto.member.BeneficiaryApplicationDTO;
import com.refitbackend.repository.member.BeneficiaryApplicationRepository;
import com.refitbackend.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class BeneficiaryApplicationServiceImpl implements BeneficiaryApplicationService {
    
    private final BeneficiaryApplicationRepository applicationRepository;
    private final MemberRepository memberRepository;
    
    @Override
    @Transactional
    public BeneficiaryApplicationDTO apply(String memberEmail, BeneficiaryApplicationDTO applicationDTO) {
        // 이미 대기중인 신청이 있는지 확인
        if (hasPendingApplication(memberEmail)) {
            throw new IllegalStateException("이미 대기중인 신청이 있습니다.");
        }
        
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        
        BeneficiaryApplication application = BeneficiaryApplication.builder()
                .member(member)
                .reason(applicationDTO.getReason())
                .situation(applicationDTO.getSituation())
                .contactInfo(applicationDTO.getContactInfo())
                .additionalInfo(applicationDTO.getAdditionalInfo())
                .documentType(applicationDTO.getDocumentType())
                .documentFile(applicationDTO.getDocumentFile())
                .status(BeneficiaryApplication.ApplicationStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .build();
        
        BeneficiaryApplication savedApplication = applicationRepository.save(application);
        
        return entityToDTO(savedApplication);
    }
    
    @Override
    public List<BeneficiaryApplicationDTO> getApplicationsByMember(String memberEmail) {
        List<BeneficiaryApplication> applications = applicationRepository.findByMemberEmailOrderByAppliedAtDesc(memberEmail);
        return applications.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<BeneficiaryApplicationDTO> getPendingApplications() {
        List<BeneficiaryApplication> applications = applicationRepository.findByStatusOrderByAppliedAtDesc(BeneficiaryApplication.ApplicationStatus.PENDING);
        return applications.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public BeneficiaryApplicationDTO approveApplication(Long applicationId, String adminComment) {
        BeneficiaryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신청입니다."));
        
        application.approve(adminComment);
        
        // 멤버에게 BENEFICIARY 역할 추가
        Member member = application.getMember();
        member.addRole(MemberRole.BENEFICIARY);
        memberRepository.save(member);
        
        BeneficiaryApplication savedApplication = applicationRepository.save(application);
        return entityToDTO(savedApplication);
    }
    
    @Override
    @Transactional
    public BeneficiaryApplicationDTO rejectApplication(Long applicationId, String adminComment) {
        BeneficiaryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신청입니다."));
        
        application.reject(adminComment);
        
        BeneficiaryApplication savedApplication = applicationRepository.save(application);
        return entityToDTO(savedApplication);
    }
    
    @Override
    public boolean hasPendingApplication(String memberEmail) {
        return applicationRepository.existsByMemberEmailAndStatus(memberEmail, BeneficiaryApplication.ApplicationStatus.PENDING);
    }
    
    private BeneficiaryApplicationDTO entityToDTO(BeneficiaryApplication application) {
        return BeneficiaryApplicationDTO.builder()
                .id(application.getId())
                .memberEmail(application.getMember().getEmail())
                .memberNickname(application.getMember().getNickname())
                .reason(application.getReason())
                .situation(application.getSituation())
                .contactInfo(application.getContactInfo())
                .additionalInfo(application.getAdditionalInfo())
                .documentType(application.getDocumentType())
                .documentFile(application.getDocumentFile())
                .status(application.getStatus().name())
                .appliedAt(application.getAppliedAt())
                .processedAt(application.getProcessedAt())
                .adminComment(application.getAdminComment())
                .build();
    }
} 