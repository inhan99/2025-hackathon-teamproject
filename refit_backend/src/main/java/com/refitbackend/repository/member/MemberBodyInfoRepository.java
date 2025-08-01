package com.refitbackend.repository.member;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.refitbackend.domain.member.Member;
import com.refitbackend.domain.member.MemberBodyInfo;

public interface MemberBodyInfoRepository extends JpaRepository<MemberBodyInfo, Long> {

    // 이메일 기준 최근 측정값
    Optional<MemberBodyInfo> findTopByMemberEmailOrderByMeasuredAtDesc(String email);

    // Member 엔티티 기준 최근 측정값
    Optional<MemberBodyInfo> findByMember(Member member);
}
