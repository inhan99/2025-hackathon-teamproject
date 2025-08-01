package com.refitbackend.dto.member;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberJoinDTO {
    private String email;
    private String pw;
    private String nickname;
}