package com.refitbackend.dto.member;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.*;
import java.util.stream.Collectors;

@Getter
@Setter
@ToString
public class MemberDTO extends User {

    // private int donationLevelInt;
    // private int donationLevelExp;
    // private int usedDonationCount;

    private String email;
    private String nickname;
    private boolean social;
    private List<String> roleNames = new ArrayList<>();

    private String donationLevel;
    private int credit;

    // member_body_info
    private double height;
    private double weight;

    // 기존 로그인용 생성자 + 확장 필드 포함
    public MemberDTO(String email, String pw, String nickname, boolean social,
                     List<String> roleNames, String donationLevel, int credit,
                     Double height, Double weight
                    //  int donationLevelInt, int donationLevelExp, int usedDonationCount
                    ) {

        super(
            email,
            pw,
            roleNames.stream()
                     .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                     .collect(Collectors.toList())
        );

        this.email = email;
        this.nickname = nickname;
        this.social = social;
        this.roleNames = roleNames;
        this.donationLevel = donationLevel;
        this.credit = credit;
        this.height = height != null ? height : 0.0;
        this.weight = weight != null ? weight : 0.0;
        // this.donationLevelInt = donationLevelInt;
        // this.donationLevelExp = donationLevelExp;
        // this.usedDonationCount = usedDonationCount;
    }

    // JWT용 생성자 (비밀번호 미포함) + 확장 필드 포함
    public MemberDTO(String email, String nickname, boolean social,
                     List<String> roleNames, String donationLevel, int credit,
                     Double height, Double weight
                    //  int donationLevelInt, int donationLevelExp, int usedDonationCount
                     ) {

        super(
            email,
            "",
            roleNames.stream()
                     .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                     .collect(Collectors.toList())
        );

        this.email = email;
        this.nickname = nickname;
        this.social = social;
        this.roleNames = roleNames;
        this.donationLevel = donationLevel;
        this.credit = credit;
        this.height = height != null ? height : 0.0;
        this.weight = weight != null ? weight : 0.0;
        // this.donationLevelInt = donationLevelInt;
        // this.donationLevelExp = donationLevelExp;
        // this.usedDonationCount = usedDonationCount;
    }

    // JWT에 포함할 claims 정보
    public Map<String, Object> getClaims() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("nickname", nickname);
        claims.put("social", social);
        claims.put("roleNames", roleNames);
        claims.put("donationLevel", donationLevel);
        claims.put("credit", credit);
        claims.put("height", height);
        claims.put("weight", weight);
        // claims.put("donationLevelInt", donationLevelInt);
        // claims.put("donationLevelExp", donationLevelExp);
        // claims.put("usedDonationCount", usedDonationCount);
        return claims;
    }
}
