package com.refitbackend.service.member;

import com.refitbackend.dto.member.MemberAddressRequestDto;
import com.refitbackend.dto.member.MemberAddressResponseDto;
import com.refitbackend.dto.member.MemberAddressListResponseDto;

import java.util.List;

public interface MemberAddressService {
    
    // 기본 배송지 등록/수정
    MemberAddressResponseDto saveDefaultAddress(String memberEmail, MemberAddressRequestDto requestDto);
    
    // 추가 배송지 등록
    MemberAddressResponseDto saveAdditionalAddress(String memberEmail, MemberAddressRequestDto requestDto);
    
    // 기본 배송지 조회
    MemberAddressResponseDto getDefaultAddress(String memberEmail);
    
    // 모든 배송지 조회
    MemberAddressListResponseDto getAllAddresses(String memberEmail);
    
    // 특정 배송지 조회
    MemberAddressResponseDto getAddressById(String memberEmail, Long addressId);
    
    // 배송지 수정
    MemberAddressResponseDto updateAddress(String memberEmail, Long addressId, MemberAddressRequestDto requestDto);
    
    // 배송지 삭제
    void deleteAddress(String memberEmail, Long addressId);
    
    // 기본 배송지 변경
    MemberAddressResponseDto setDefaultAddress(String memberEmail, Long addressId);
} 