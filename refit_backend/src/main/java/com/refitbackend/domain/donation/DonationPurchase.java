package com.refitbackend.domain.donation;

import com.refitbackend.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "donation_purchase")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DonationPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 구매자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // 어떤 기부 상품을 샀는지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_product_id", nullable = false)
    private DonationProduct donationProduct;

    // 구매일시
    @Column(nullable = false)
    private LocalDateTime purchasedAt;

    // 구매 개수 (기본 1개)
    @Column(nullable = false)
    private int quantity;
}
