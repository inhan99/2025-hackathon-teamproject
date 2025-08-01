package com.refitbackend.service.member;

import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.member.MemberAddress;
import com.refitbackend.dto.member.MemberAddressRequestDto;
import com.refitbackend.dto.member.MemberAddressResponseDto;
import com.refitbackend.dto.member.MemberAddressListResponseDto;
import com.refitbackend.repository.member.MemberAddressRepository;
import com.refitbackend.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class MemberAddressServiceImpl implements MemberAddressService {

    private final MemberAddressRepository memberAddressRepository;
    private final MemberRepository memberRepository;

    @Override
    public MemberAddressResponseDto saveDefaultAddress(String memberEmail, MemberAddressRequestDto requestDto) {
        // 회원 존재 확인
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 기존 기본 배송지 확인
        MemberAddress existingDefaultAddress = memberAddressRepository.findDefaultAddressByMemberEmail(memberEmail).orElse(null);

        if (existingDefaultAddress != null) {
            // 기존 기본 배송지가 있으면 업데이트
            existingDefaultAddress.setRecipientName(requestDto.getRecipientName());
            existingDefaultAddress.setPhoneNumber(requestDto.getPhoneNumber());
            existingDefaultAddress.setPostalCode(requestDto.getPostalCode());
            existingDefaultAddress.setAddress(requestDto.getAddress());
            existingDefaultAddress.setDetailAddress(requestDto.getDetailAddress());
            // isDefault는 이미 true이므로 변경하지 않음

            MemberAddress updatedAddress = memberAddressRepository.save(existingDefaultAddress);
            return convertToResponseDto(updatedAddress);
        } else {
            // 기존 기본 배송지가 없으면 새로 생성
            MemberAddress newAddress = MemberAddress.builder()
                    .member(member)
                    .recipientName(requestDto.getRecipientName())
                    .phoneNumber(requestDto.getPhoneNumber())
                    .postalCode(requestDto.getPostalCode())
                    .address(requestDto.getAddress())
                    .detailAddress(requestDto.getDetailAddress())
                    .isDefault(true) // 기본 배송지로 설정
                    .build();

            MemberAddress savedAddress = memberAddressRepository.save(newAddress);
            return convertToResponseDto(savedAddress);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MemberAddressResponseDto getDefaultAddress(String memberEmail) {
        MemberAddress defaultAddress = memberAddressRepository.findDefaultAddressByMemberEmail(memberEmail)
                .orElse(null);
        
        return defaultAddress != null ? convertToResponseDto(defaultAddress) : null;
    }

    @Override
    @Transactional(readOnly = true)
    public MemberAddressListResponseDto getAllAddresses(String memberEmail) {
        List<MemberAddress> addresses = memberAddressRepository.findAllByMemberEmail(memberEmail);
        
        List<MemberAddressResponseDto> addressDtos = addresses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());

        boolean hasDefaultAddress = memberAddressRepository.existsDefaultAddressByMemberEmail(memberEmail);

        return MemberAddressListResponseDto.builder()
                .memberEmail(memberEmail)
                .addresses(addressDtos)
                .totalCount(addressDtos.size())
                .hasDefaultAddress(hasDefaultAddress)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MemberAddressResponseDto getAddressById(String memberEmail, Long addressId) {
        MemberAddress address = memberAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배송지입니다."));

        // 본인의 배송지인지 확인
        if (!address.getMember().getEmail().equals(memberEmail)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        return convertToResponseDto(address);
    }

    @Override
    public MemberAddressResponseDto updateAddress(String memberEmail, Long addressId, MemberAddressRequestDto requestDto) {
        MemberAddress address = memberAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배송지입니다."));

        // 본인의 배송지인지 확인
        if (!address.getMember().getEmail().equals(memberEmail)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        // 기본 배송지로 변경하는 경우, 기존 기본 배송지 해제
        if (requestDto.isDefault() && !address.isDefault()) {
            memberAddressRepository.findDefaultAddressByMemberEmail(memberEmail)
                    .ifPresent(existingAddress -> existingAddress.setAsNotDefault());
        }

        // 배송지 정보 업데이트
        address.setRecipientName(requestDto.getRecipientName());
        address.setPhoneNumber(requestDto.getPhoneNumber());
        address.setPostalCode(requestDto.getPostalCode());
        address.setAddress(requestDto.getAddress());
        address.setDetailAddress(requestDto.getDetailAddress());
        address.setDefault(requestDto.isDefault());

        MemberAddress updatedAddress = memberAddressRepository.save(address);
        return convertToResponseDto(updatedAddress);
    }

    @Override
    public void deleteAddress(String memberEmail, Long addressId) {
        MemberAddress address = memberAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배송지입니다."));

        // 본인의 배송지인지 확인
        if (!address.getMember().getEmail().equals(memberEmail)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        // 기본 배송지는 삭제 불가
        if (address.isDefault()) {
            throw new IllegalArgumentException("기본 배송지는 삭제할 수 없습니다.");
        }

        memberAddressRepository.delete(address);
    }

    @Override
    public MemberAddressResponseDto setDefaultAddress(String memberEmail, Long addressId) {
        MemberAddress address = memberAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배송지입니다."));

        // 본인의 배송지인지 확인
        if (!address.getMember().getEmail().equals(memberEmail)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        // 기존 기본 배송지 해제
        memberAddressRepository.findDefaultAddressByMemberEmail(memberEmail)
                .ifPresent(existingAddress -> existingAddress.setAsNotDefault());

        // 새로운 기본 배송지 설정
        address.setAsDefault();
        MemberAddress updatedAddress = memberAddressRepository.save(address);
        
        return convertToResponseDto(updatedAddress);
    }

    @Override
    public MemberAddressResponseDto saveAdditionalAddress(String memberEmail, MemberAddressRequestDto requestDto) {
        // 회원 존재 확인
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 추가 배송지는 항상 isDefault = false로 생성
        MemberAddress newAddress = MemberAddress.builder()
                .member(member)
                .recipientName(requestDto.getRecipientName())
                .phoneNumber(requestDto.getPhoneNumber())
                .postalCode(requestDto.getPostalCode())
                .address(requestDto.getAddress())
                .detailAddress(requestDto.getDetailAddress())
                .isDefault(false) // 추가 배송지는 기본 배송지가 아님
                .build();

        MemberAddress savedAddress = memberAddressRepository.save(newAddress);
        return convertToResponseDto(savedAddress);
    }

    // 엔티티를 DTO로 변환하는 헬퍼 메서드
    private MemberAddressResponseDto convertToResponseDto(MemberAddress memberAddress) {
        return MemberAddressResponseDto.builder()
                .id(memberAddress.getId())
                .memberEmail(memberAddress.getMember().getEmail())
                .recipientName(memberAddress.getRecipientName())
                .phoneNumber(memberAddress.getPhoneNumber())
                .postalCode(memberAddress.getPostalCode())
                .address(memberAddress.getAddress())
                .detailAddress(memberAddress.getDetailAddress())
                .isDefault(memberAddress.isDefault())
                .createdAt(memberAddress.getCreatedAt())
                .updatedAt(memberAddress.getUpdatedAt())
                .build();
    }
} 