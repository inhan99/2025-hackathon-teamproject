package com.refitbackend.domain.member;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class MemberBodyInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double height;
    private Double weight;

    private LocalDateTime measuredAt;

    @OneToOne
    @JoinColumn(name = "member_email", columnDefinition = "VARCHAR(255)")
    private Member member;
}
