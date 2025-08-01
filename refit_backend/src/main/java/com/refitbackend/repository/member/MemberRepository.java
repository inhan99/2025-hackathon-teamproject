package com.refitbackend.repository.member;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.refitbackend.domain.member.Member;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {

     // userRoleList를 함께 가져오는 쿼리
     @EntityGraph(attributePaths = {"roleList"})
     @Query("SELECT m FROM Member m WHERE m.email = :email")
     Optional<Member> findByEmail(String email);
 
     // Member getWithRoles(@Param("email") String email);
     
     boolean existsByEmail(String email);
 }
