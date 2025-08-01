package com.refitbackend.dto.donation;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequestDTO {

    private Long productId;
    private String title;
    private String reason;
    private String condition;
    private String pickupMethod;
    private String rewardMethod;
    private String size;
    private LocalDateTime requestDate; 
    private List<String> imageUrls;
}
