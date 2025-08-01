package com.refitbackend.domain.member;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "member_point")
@Getter
@Setter
public class MemberPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "member_id", unique = true, columnDefinition = "VARCHAR(255)")
    private Member member;

    private int donationPoint; // 기존 포인트 (유지)

    @Enumerated(EnumType.STRING)
    private DonationLevel donationLevel; // 기존 포인트 기반 레벨 (포인트 기반 레벨은 유지해도 무방)

    private int credit;

    // === 새로 추가할 필드 ===
    private int donationLevelExp = 0;       // 0~99 경험치
    private int donationLevelInt = 1;       // 1 ~ 100 경험치 기반 레벨

    private int usedDonationCount = 0;      // 현재 레벨에서 사용한 나눔 수령 횟수

    // 기존 포인트 적립 메서드
    public void addPoint(int amount) {
        this.donationPoint += amount;
        // 필요 시 포인트 기반 레벨업 처리 로직 추가 가능
    }

    // === 경험치 적립 및 레벨업 처리 메서드 ===
    public void addDonationExp(int amount) {
        int totalExp = this.donationLevelExp + amount;
        int levelUp = totalExp / 100;
        this.donationLevelInt = Math.min(100, this.donationLevelInt + levelUp);
        this.donationLevelExp = totalExp % 100;

        // 레벨업 시 usedDonationCount 초기화 여부는 현재 유지 안 함
        /*
        if (levelUp > 0) {
            this.usedDonationCount = 0;
        }
        */
    }

    // 나눔 가능 여부 판단
    public boolean canReceiveDonation() {
        return usedDonationCount < donationLevelInt;
    }

    // 나눔 상품 수령 시 사용 횟수 증가
    public void useDonationCount() {
        if (!canReceiveDonation()) {
            throw new IllegalStateException("나눔 횟수 초과");
        }
        this.usedDonationCount++;
    }
}
