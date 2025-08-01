package com.refitbackend.service.member;


import org.springframework.transaction.annotation.Transactional;

import com.refitbackend.dto.member.MemberDTO;
import com.refitbackend.dto.member.MemberJoinDTO;
import com.refitbackend.dto.member.MemberLoginDTO;
import com.refitbackend.dto.member.MemberModifyDTO;

@Transactional
public interface MemberService {
    void join(MemberJoinDTO joinDTO);
    MemberDTO login(MemberLoginDTO loginDTO);
    void modifyMember(MemberModifyDTO memberModifyDTO);


    

} 
