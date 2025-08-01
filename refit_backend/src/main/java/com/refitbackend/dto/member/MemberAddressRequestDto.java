package com.refitbackend.dto.member;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MemberAddressRequestDto {
    
    private String recipientName;
    
    private String phoneNumber;
    
    private String postalCode;
    
    private String address;
    
    private String detailAddress;
    
    @Builder.Default
    private boolean isDefault = true;
} 