package com.refitbackend.service.member;

import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.member.MemberBodyInfo;
import com.refitbackend.domain.member.MemberRole;
import com.refitbackend.dto.member.MemberDTO;
import com.refitbackend.dto.member.MemberJoinDTO;
import com.refitbackend.dto.member.MemberLoginDTO;
import com.refitbackend.dto.member.MemberModifyDTO;
import com.refitbackend.repository.member.MemberBodyInfoRepository;
import com.refitbackend.repository.member.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final MemberBodyInfoRepository memberBodyInfoRepository;

    @Override
    public void join(MemberJoinDTO joinDTO) {
        boolean exists = memberRepository.existsByEmail(joinDTO.getEmail());

        if (exists) {
            throw new IllegalStateException("이미 가입된 이메일입니다.");
        }

        Member member = Member.builder()
                .email(joinDTO.getEmail())
                .pw(passwordEncoder.encode(joinDTO.getPw()))
                .nickname(joinDTO.getNickname())
                .social(false)
                .build();

        member.addRole(MemberRole.MEMBER);

        memberRepository.save(member);
        log.info("회원가입 완료: {}", member);
    }

    @Override
public MemberDTO login(MemberLoginDTO loginDTO) {
    Member member = memberRepository.findByEmail(loginDTO.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("이메일이 존재하지 않습니다."));

    if (!passwordEncoder.matches(loginDTO.getPw(), member.getPw())) {
        throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
    }

    List<String> roles = member.getRoleList()
            .stream()
            .map(Enum::name)
            .toList();

    // MemberPoint 데이터 가져오기
    String donationLevel = Optional.ofNullable(member.getMemberPoint())
            .map(mp -> mp.getDonationLevel().name())
            .orElse("LEVEL_1");

    int credit = Optional.ofNullable(member.getMemberPoint())
            .map(mp -> mp.getCredit())
            .orElse(0);


        Optional<MemberBodyInfo> optionalBodyInfo =
        memberBodyInfoRepository.findTopByMemberEmailOrderByMeasuredAtDesc(member.getEmail());
       double height = optionalBodyInfo.map(MemberBodyInfo::getHeight).orElse(0.0);
       double weight = optionalBodyInfo.map(MemberBodyInfo::getWeight).orElse(0.0);

    //         int donationLevelInt = Optional.ofNullable(member.getMemberPoint())
    //         .map(mp -> mp.getDonationLevelInt())
    //         .orElse(0);

    // int donationLevelExp = Optional.ofNullable(member.getMemberPoint())
    //         .map(mp -> mp.getDonationLevelExp())
    //         .orElse(0);

    // int usedDonationCount = Optional.ofNullable(member.getMemberPoint())
    //         .map(mp -> mp.getUsedDonationCount())
    //         .orElse(0);
      
            return new MemberDTO(
                member.getEmail(),
                member.getPw(),
                member.getNickname(),
                member.isSocial(),
                roles,
                donationLevel,
                credit,
                height,
                weight
                // donationLevelInt,
                // donationLevelExp,
                // usedDonationCount
    );
}

@Override
public void modifyMember(MemberModifyDTO memberModifyDTO) {

    Member member = memberRepository.findById(memberModifyDTO.getEmail())
        .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

    // 1. 비밀번호 변경
    member.changePw(passwordEncoder.encode(memberModifyDTO.getPw()));

    // 2. 닉네임 변경
    member.changeNickname(memberModifyDTO.getNickname());

    // 3. 기존 BodyInfo 존재 여부 확인 후 처리
    Optional<MemberBodyInfo> optionalBodyInfo = memberBodyInfoRepository.findTopByMemberEmailOrderByMeasuredAtDesc(member.getEmail());

    MemberBodyInfo bodyInfo;
    if (optionalBodyInfo.isPresent()) {
        // 존재 → 업데이트
        bodyInfo = optionalBodyInfo.get();
        bodyInfo.setHeight(memberModifyDTO.getHeight().doubleValue());
        bodyInfo.setWeight(memberModifyDTO.getWeight().doubleValue());
        bodyInfo.setMeasuredAt(LocalDateTime.now());
    } else {
        // 없음 → 새로 생성
        bodyInfo = new MemberBodyInfo();
        bodyInfo.setMember(member);
        bodyInfo.setHeight(memberModifyDTO.getHeight().doubleValue());
        bodyInfo.setWeight(memberModifyDTO.getWeight().doubleValue());
        bodyInfo.setMeasuredAt(LocalDateTime.now());
    }

    // 4. 저장
    memberRepository.save(member);
    memberBodyInfoRepository.save(bodyInfo);
}

}