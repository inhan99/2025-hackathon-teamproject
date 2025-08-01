package com.refitbackend.controller.member;

import org.springframework.web.bind.annotation.RestController;

import com.refitbackend.dto.member.MemberDTO;
import com.refitbackend.service.member.MemberService;
import com.refitbackend.service.member.SocialMemberService;
import com.refitbackend.util.JWTUtil;

// import com.mallapi.dto.MemberModifyDTO;


import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.time.Duration;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;


@RestController
@Log4j2
@RequiredArgsConstructor
public class SocialController {

    private final SocialMemberService socialMemberService;
    private final MemberService memberService;
    private final JWTUtil jwtUtil;

    @GetMapping("/api/member/kakao")
    public Map<String, Object> getMemberFromKakao(String accessToken) {
        log.info("accessToken: {}", accessToken);

        MemberDTO memberDTO = socialMemberService.getKakaoMember(accessToken);

        // 클레임에 나눔레벨, 적립금 추가
        Map<String, Object> claims = Map.of(
            "sub", memberDTO.getEmail(),
            "email", memberDTO.getEmail(),
            "nickname", memberDTO.getNickname(),
            "social", memberDTO.isSocial(),
            "roleNames", memberDTO.getRoleNames(),
            "donationLevel", memberDTO.getDonationLevel(),   // 추가
            "credit", memberDTO.getCredit(),
            "height", memberDTO.getHeight(),
            "weight", memberDTO.getWeight()
                           // 추가
        );

        // 토큰 발급
        String jwtAccessToken = jwtUtil.generateToken(claims, Duration.ofMinutes(60 * 24));
        String jwtRefreshToken = jwtUtil.generateToken(claims, Duration.ofDays(7));

        // 응답 구성
        return Map.of(
            "accessToken", jwtAccessToken,
            "refreshToken", jwtRefreshToken,
            "member", memberDTO
        );
    }
}
