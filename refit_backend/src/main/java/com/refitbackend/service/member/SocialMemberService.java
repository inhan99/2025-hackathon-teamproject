package com.refitbackend.service.member;

import java.util.List;
import java.util.Optional;

import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.member.MemberBodyInfo;
import com.refitbackend.dto.member.MemberDTO;
import com.refitbackend.repository.member.MemberBodyInfoRepository;

public interface SocialMemberService {
    MemberDTO getKakaoMember(String accessToken);

    default MemberDTO entityToDTO(Member member, MemberBodyInfoRepository memberBodyInfoRepository) {
        List<String> roles = member.getRoleList()
                .stream()
                .map(Enum::name)
                .toList();

        // MemberPoint가 null일 수 있으니 Optional로 안전 처리
        String donationLevel = Optional.ofNullable(member.getMemberPoint())
                .map(mp -> mp.getDonationLevel().name())
                .orElse("LEVEL_1");

        int credit = Optional.ofNullable(member.getMemberPoint())
                .map(mp -> mp.getCredit())
                .orElse(0);

        // MemberBodyInfoRepository를 사용하여 최신 키/몸무게 정보 가져오기
        Optional<MemberBodyInfo> optionalBodyInfo = 
            memberBodyInfoRepository.findTopByMemberEmailOrderByMeasuredAtDesc(member.getEmail());

        double height = optionalBodyInfo.map(MemberBodyInfo::getHeight).orElse(0.0);
        double weight = optionalBodyInfo.map(MemberBodyInfo::getWeight).orElse(0.0);
//  int donationLevelInt = Optional.ofNullable(member.getMemberPoint())
//             .map(mp -> mp.getDonationLevelInt())
//             .orElse(0);

//     int donationLevelExp = Optional.ofNullable(member.getMemberPoint())
//             .map(mp -> mp.getDonationLevelExp())
//             .orElse(0);

//     int usedDonationCount = Optional.ofNullable(member.getMemberPoint())
//             .map(mp -> mp.getUsedDonationCount())
//             .orElse(0);

        return new MemberDTO(
            member.getEmail(),
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
}
