package com.refitbackend.dto.member;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MemberAddressResponseDto {
    
    private Long id;
    
    private String memberEmail;
    
    private String recipientName;
    
    private String phoneNumber;
    
    private String postalCode;
    
    private String address;
    
    private String detailAddress;
    
    private boolean isDefault;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 