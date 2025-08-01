package com.refitbackend.repository.member;

import com.refitbackend.domain.member.MemberAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberAddressRepository extends JpaRepository<MemberAddress, Long> {
    
    // member_email로 기본 배송지 조회
    @Query("SELECT ma FROM MemberAddress ma WHERE ma.member.email = :memberEmail AND ma.isDefault = true")
    Optional<MemberAddress> findDefaultAddressByMemberEmail(@Param("memberEmail") String memberEmail);
    
    // member_email로 모든 배송지 조회
    @Query("SELECT ma FROM MemberAddress ma WHERE ma.member.email = :memberEmail ORDER BY ma.isDefault DESC, ma.createdAt DESC")
    List<MemberAddress> findAllByMemberEmail(@Param("memberEmail") String memberEmail);
    
    // 기본 배송지가 있는지 확인
    @Query("SELECT COUNT(ma) > 0 FROM MemberAddress ma WHERE ma.member.email = :memberEmail AND ma.isDefault = true")
    boolean existsDefaultAddressByMemberEmail(@Param("memberEmail") String memberEmail);
    
    // 특정 회원의 기본 배송지 개수 조회 (기본 배송지는 1개만 있어야 함)
    @Query("SELECT COUNT(ma) FROM MemberAddress ma WHERE ma.member.email = :memberEmail AND ma.isDefault = true")
    long countDefaultAddressesByMemberEmail(@Param("memberEmail") String memberEmail);
    
    // 기본 배송지가 아닌 배송지들 조회
    @Query("SELECT ma FROM MemberAddress ma WHERE ma.member.email = :memberEmail AND ma.isDefault = false ORDER BY ma.createdAt DESC")
    List<MemberAddress> findNonDefaultAddressesByMemberEmail(@Param("memberEmail") String memberEmail);
} 