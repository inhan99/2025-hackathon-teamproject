package com.refitbackend.dto.member;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class BeneficiaryApplicationDTO {
    
    private Long id;
    private String memberEmail;
    private String memberNickname;
    private String reason;
    private String situation;
    private String contactInfo;
    private String additionalInfo;
    private String documentType;
    private String documentFile;
    private String status;
    private LocalDateTime appliedAt;
    private LocalDateTime processedAt;
    private String adminComment;
} 