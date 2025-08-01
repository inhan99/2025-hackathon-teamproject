package com.refitbackend.dto.donation;

import java.util.List;

import com.refitbackend.domain.member.MemberRole;

import lombok.*;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationProductsDetailDTO {

    private Long donationProductId;

    private Long originalProductId;
    private String productName;
    private String productDescription;

    private String conditionNote;

    private String donorNickname; // 기부자 닉네임 추가
    private String status;        // 기부 상태 (APPROVED 등) 추가
    private String rejectionReason; // 반려 사유 (있을 경우)
    
    private List<DonationImageDTO> images;
    private List<DonationOptionDTO> options;
       private MemberRole targetRole; 
}

