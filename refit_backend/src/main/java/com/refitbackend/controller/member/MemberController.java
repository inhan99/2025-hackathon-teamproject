package com.refitbackend.controller.member;

import com.refitbackend.dto.member.MemberDTO;
import com.refitbackend.dto.member.MemberJoinDTO;
import com.refitbackend.dto.member.MemberLoginDTO;
import com.refitbackend.dto.member.MemberModifyDTO;
import com.refitbackend.service.member.MemberService;
import com.refitbackend.util.JWTUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
@Log4j2
public class MemberController {

    private final MemberService memberService;
    private final JWTUtil jwtUtil;

    @PostMapping("/join")
    public String join(@RequestBody MemberJoinDTO joinDTO) {
        log.info("회원가입 요청: {}", joinDTO);
        memberService.join(joinDTO);
        return "회원가입 성공";
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody MemberLoginDTO loginDTO) {
        log.info("로그인 요청: {}", loginDTO);

        // 1. 유저 인증 + 정보 반환
        MemberDTO memberDTO = memberService.login(loginDTO);

        // 2. 토큰 클레임 구성
        Map<String, Object> claims = Map.of(
            "sub", memberDTO.getEmail(),
            "email", memberDTO.getEmail(),
            "nickname", memberDTO.getNickname(),
            "social", memberDTO.isSocial(),
            "roleNames", memberDTO.getRoleNames(),
            "donationLevel", memberDTO.getDonationLevel(),   // 추가
            "credit", memberDTO.getCredit(),
            "height", memberDTO.getHeight(),
            "weight", memberDTO.getWeight()                  // 추가             // 추가
        );

        // 3. 토큰 발급
        String accessToken = jwtUtil.generateToken(claims, Duration.ofMinutes(30));
        String refreshToken = jwtUtil.generateToken(claims, Duration.ofDays(7));

        // 4. 응답 구성
        Map<String, Object> memberMap = new HashMap<>();
memberMap.put("email", memberDTO.getEmail());
memberMap.put("nickname", memberDTO.getNickname());
memberMap.put("username", memberDTO.getUsername()); 
memberMap.put("roleNames", memberDTO.getRoleNames());
memberMap.put("social", memberDTO.isSocial());
memberMap.put("donationLevel", memberDTO.getDonationLevel()); 
memberMap.put("credit", memberDTO.getCredit());             
memberMap.put("height", memberDTO.getHeight());
memberMap.put("weight", memberDTO.getWeight());  

Map<String, Object> response = Map.of(
    "accessToken", accessToken,
    "refreshToken", refreshToken,
    "member", memberMap 
);



return ResponseEntity.ok(response);
    }

    @PutMapping("/modify")
    public ResponseEntity<Map<String, Object>> modify(@RequestBody MemberModifyDTO memberModifyDTO) {
        log.info("member modify: " + memberModifyDTO);
        memberService.modifyMember(memberModifyDTO);
        
        // 수정된 회원 정보로 새로운 JWT 토큰 발급
        MemberDTO memberDTO = memberService.login(new MemberLoginDTO(memberModifyDTO.getEmail(), memberModifyDTO.getPw()));
        
        // 토큰 클레임 구성
        Map<String, Object> claims = Map.of(
            "sub", memberDTO.getEmail(),
            "email", memberDTO.getEmail(),
            "nickname", memberDTO.getNickname(),
            "social", memberDTO.isSocial(),
            "roleNames", memberDTO.getRoleNames(),
            "donationLevel", memberDTO.getDonationLevel(),
            "credit", memberDTO.getCredit(),
            "height", memberDTO.getHeight(),
            "weight", memberDTO.getWeight()
        );

        // 토큰 발급
        String accessToken = jwtUtil.generateToken(claims, Duration.ofMinutes(30));
        String refreshToken = jwtUtil.generateToken(claims, Duration.ofDays(7));

        // 응답 구성
        Map<String, Object> memberMap = new HashMap<>();
        memberMap.put("email", memberDTO.getEmail());
        memberMap.put("nickname", memberDTO.getNickname());
        memberMap.put("username", memberDTO.getUsername()); 
        memberMap.put("roleNames", memberDTO.getRoleNames());
        memberMap.put("social", memberDTO.isSocial());
        memberMap.put("donationLevel", memberDTO.getDonationLevel()); 
        memberMap.put("credit", memberDTO.getCredit());             
        memberMap.put("height", memberDTO.getHeight());
        memberMap.put("weight", memberDTO.getWeight());  

        Map<String, Object> response = Map.of(
            "accessToken", accessToken,
            "refreshToken", refreshToken,
            "member", memberMap 
        );

        return ResponseEntity.ok(response);
    }
}
