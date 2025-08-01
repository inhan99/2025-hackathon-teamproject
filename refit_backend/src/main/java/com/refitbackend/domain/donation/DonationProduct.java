package com.refitbackend.domain.donation;

import com.refitbackend.domain.member.DonationLevel;
import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.product.Category;
import com.refitbackend.domain.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "donation_products")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product originalProduct;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id")
    private Member donor;

    @Enumerated(EnumType.STRING)
    private DonationStatus status;

    @Column(length = 1000)
    private String conditionNote;

    private LocalDateTime donatedAt;
    private LocalDateTime inspectedAt;

    private Integer rewardPoint;

    private String rejectionReason;

    @OneToMany(mappedBy = "donationProduct", cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private Set<DonationOption> options = new HashSet<>();


@OneToMany(mappedBy = "donationProduct", cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private Set<DonationImage> images = new HashSet<>();


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

        // 🔹 해당 상품 기부 시 제공되는 경험치
    private int experienceReward;

    // 🔹 일반 유저가 이 상품을 나눔받기 위해 필요한 최소 레벨
    @Enumerated(EnumType.STRING)
    private DonationLevel requiredLevel;

}
