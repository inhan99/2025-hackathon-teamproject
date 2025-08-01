package com.refitbackend.repository.member;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.refitbackend.domain.member.MemberPoint;

@Repository
public interface MemberPointRepository extends JpaRepository<MemberPoint, Long> {
    Optional<MemberPoint> findByMemberEmail(String email);
}
