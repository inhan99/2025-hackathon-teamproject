package com.refitbackend.controller.member;

import com.refitbackend.dto.member.MemberAddressRequestDto;
import com.refitbackend.dto.member.MemberAddressResponseDto;
import com.refitbackend.dto.member.MemberAddressListResponseDto;
import com.refitbackend.service.member.MemberAddressService;
import com.refitbackend.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@Log4j2
public class MemberAddressController {

    private final MemberAddressService memberAddressService;
    private final JWTUtil jwtUtil;

    // 기본 배송지 조회
    @GetMapping("/default-address")
    public ResponseEntity<MemberAddressResponseDto> getDefaultAddress(@RequestHeader("Authorization") String authHeader) {
        try {
            String memberEmail = extractMemberEmail(authHeader);
            MemberAddressResponseDto defaultAddress = memberAddressService.getDefaultAddress(memberEmail);
            
            if (defaultAddress != null) {
                return ResponseEntity.ok(defaultAddress);
            } else {
                return ResponseEntity.noContent().build();
            }
        } catch (Exception e) {
            log.error("기본 배송지 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 기본 배송지 등록/수정
    @PostMapping("/default-address")
    public ResponseEntity<MemberAddressResponseDto> saveDefaultAddress(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody MemberAddressRequestDto requestDto) {
        try {
            String memberEmail = extractMemberEmail(authHeader);
            MemberAddressResponseDto savedAddress = memberAddressService.saveDefaultAddress(memberEmail, requestDto);
            return ResponseEntity.ok(savedAddress);
        } catch (IllegalArgumentException e) {
            log.error("기본 배송지 저장 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("기본 배송지 저장 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 추가 배송지 등록
    @PostMapping("/addresses")
    public ResponseEntity<MemberAddressResponseDto> saveAdditionalAddress(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody MemberAddressRequestDto requestDto) {
        try {
            String memberEmail = extractMemberEmail(authHeader);
            MemberAddressResponseDto savedAddress = memberAddressService.saveAdditionalAddress(memberEmail, requestDto);
            return ResponseEntity.ok(savedAddress);
        } catch (IllegalArgumentException e) {
            log.error("추가 배송지 저장 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("추가 배송지 저장 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 모든 배송지 조회
    @GetMapping("/addresses")
    public ResponseEntity<MemberAddressListResponseDto> getAllAddresses(@RequestHeader("Authorization") String authHeader) {
        try {
            String memberEmail = extractMemberEmail(authHeader);
            MemberAddressListResponseDto addresses = memberAddressService.getAllAddresses(memberEmail);
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            log.error("배송지 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 특정 배송지 조회
    @GetMapping("/addresses/{addressId}")
    public ResponseEntity<MemberAddressResponseDto> getAddressById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long addressId) {
        try {
            String memberEmail = extractMemberEmail(authHeader);
            MemberAddressResponseDto address = memberAddressService.getAddressById(memberEmail, addressId);
            return ResponseEntity.ok(address);
        } catch (IllegalArgumentException e) {
            log.error("배송지 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("배송지 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 배송지 수정
    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<MemberAddressResponseDto> updateAddress(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long addressId,
            @RequestBody MemberAddressRequestDto requestDto) {
        try {
            String memberEmail = extractMemberEmail(authHeader);
            MemberAddressResponseDto updatedAddress = memberAddressService.updateAddress(memberEmail, addressId, requestDto);
            return ResponseEntity.ok(updatedAddress);
        } catch (IllegalArgumentException e) {
            log.error("배송지 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("배송지 수정 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 배송지 삭제
    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long addressId) {
        try {
            String memberEmail = extractMemberEmail(authHeader);
            memberAddressService.deleteAddress(memberEmail, addressId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("배송지 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("배송지 삭제 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 기본 배송지 변경
    @PutMapping("/addresses/{addressId}/default")
    public ResponseEntity<MemberAddressResponseDto> setDefaultAddress(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long addressId) {
        try {
            String memberEmail = extractMemberEmail(authHeader);
            MemberAddressResponseDto defaultAddress = memberAddressService.setDefaultAddress(memberEmail, addressId);
            return ResponseEntity.ok(defaultAddress);
        } catch (IllegalArgumentException e) {
            log.error("기본 배송지 변경 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("기본 배송지 변경 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // JWT 토큰에서 member_email 추출하는 헬퍼 메서드
    private String extractMemberEmail(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("유효하지 않은 인증 헤더입니다.");
        }

        String token = authHeader.substring(7); // "Bearer " 제거
        Map<String, Object> claims = jwtUtil.validateToken(token);
        String memberEmail = (String) claims.get("email");
        
        if (memberEmail == null) {
            throw new IllegalArgumentException("토큰에서 이메일 정보를 찾을 수 없습니다.");
        }
        
        return memberEmail;
    }
} 