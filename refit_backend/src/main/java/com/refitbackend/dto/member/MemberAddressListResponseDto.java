package com.refitbackend.dto.member;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MemberAddressListResponseDto {
    
    private String memberEmail;
    
    private List<MemberAddressResponseDto> addresses;
    
    private int totalCount;
    
    private boolean hasDefaultAddress;
} 