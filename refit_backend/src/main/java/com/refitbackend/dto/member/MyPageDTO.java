package com.refitbackend.dto.member;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyPageDTO {

    private String email;
    private String nickname;
    private String donationLevel;   // (예: BRONZE, SILVER 등 포인트 기반 등급)
    private int credit;

    // 🎯 경험치 기반 레벨 관련 추가 정보
    private int donationLevelInt;       // 경험치 기반 레벨 (예: 1~100)
    private int donationLevelExp;       // 현재 경험치 (예: 0~99)
    private int nextLevelExp;           // 다음 레벨까지 남은 경험치
    private int usedDonationCount;      // 현재 레벨에서 사용한 나눔 횟수
}
