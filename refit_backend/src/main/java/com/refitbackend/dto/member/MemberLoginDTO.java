package com.refitbackend.dto.member;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberLoginDTO {
    private String email;
    private String pw;
}