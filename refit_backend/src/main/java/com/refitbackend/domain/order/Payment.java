package com.refitbackend.domain.order;

import com.refitbackend.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    private Member member;

    private String impUid; // 포트원 결제 고유번호
    private String merchantUid; // 주문번호
    private String pgProvider; // PG사
    private String payMethod; // 결제수단
    private int amount; // 결제금액
    private String status; // 결제상태 (paid, cancelled, failed)
    private LocalDateTime paidAt; // 결제완료시간
    private LocalDateTime createdAt; // 생성시간
} 