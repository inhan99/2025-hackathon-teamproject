package com.refitbackend.domain.member;

import jakarta.persistence.*;
import lombok.*;

import java.util.*;

import com.refitbackend.domain.product.Like;
import com.refitbackend.domain.review.Review;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString(exclude = "roleList")  
public class Member {
    @Id
    @Column(columnDefinition = "VARCHAR(255)")
    private String email;

    private String pw;

    private String nickname;

    private boolean social;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "member_roles", joinColumns = @JoinColumn(name = "member_email"))
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private List<MemberRole> roleList = new ArrayList<>();

    public void addRole(MemberRole memberRole) {
        roleList.add(memberRole);
    }

    public void clearRole() {
        roleList.clear();
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void changePw(String pw) {
        this.pw = pw;
    }

    public void changeSocial(boolean social) {
        this.social = social;
    }
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();
    @OneToOne(mappedBy = "member", cascade = CascadeType.ALL)
    private MemberPoint memberPoint;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Like> likes = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "member_email")
    private MemberBodyInfo memberBodyInfo;
}