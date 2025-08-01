package com.refitbackend.dto.member;

import lombok.Data;

@Data
public class MemberModifyDTO {
    
    private String email;

    private String pw;

    private String nickname;

    private Long height;
    
    private Long weight;

}
