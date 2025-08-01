package com.refitbackend.domain.donation;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "donation_options")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 기부 제품에 속한 옵션인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_product_id")
    private DonationProduct donationProduct;

    private String size; 
    private int stock;   
}
