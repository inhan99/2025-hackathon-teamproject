package com.refitbackend.domain.member;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_address")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "member")
public class MemberAddress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_email", nullable = false)
    private Member member;
    
    @Column(name = "recipient_name", nullable = false)
    private String recipientName;
    
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;
    
    @Column(name = "postal_code", nullable = false)
    private String postalCode;
    
    @Column(name = "address", nullable = false)
    private String address;
    
    @Column(name = "detail_address")
    private String detailAddress;
    
    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean isDefault = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // 기본 배송지 설정 메서드
    public void setAsDefault() {
        this.isDefault = true;
    }
    
    // 기본 배송지 해제 메서드
    public void setAsNotDefault() {
        this.isDefault = false;
    }
} 