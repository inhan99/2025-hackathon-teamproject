package com.refitbackend.domain.donation;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "donation_images")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 기부 상품에 속한 이미지인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_product_id")
    private DonationProduct donationProduct;

    private String imageUrl;

}
