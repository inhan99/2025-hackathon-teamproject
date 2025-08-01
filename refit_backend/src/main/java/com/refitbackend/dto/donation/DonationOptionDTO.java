package com.refitbackend.dto.donation;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationOptionDTO {
    private Long id;
    private String size;
    private int stock;
}
