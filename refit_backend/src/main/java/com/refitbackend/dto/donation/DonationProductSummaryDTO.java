package com.refitbackend.dto.donation;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationProductSummaryDTO {

    private Long donationProductId;

    private String productName;
    private String brandName;
    private String categoryName;
    private String categorySubName;
    private String mainImageUrl;
    private List<DonationImageDTO> images;
    private String conditionNote;
    private String donorNickname;
    private LocalDateTime donatedAt;
}
