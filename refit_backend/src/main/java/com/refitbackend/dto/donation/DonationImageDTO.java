package com.refitbackend.dto.donation;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationImageDTO {
    private Long id;
    private String url;
    private String altText;
}
