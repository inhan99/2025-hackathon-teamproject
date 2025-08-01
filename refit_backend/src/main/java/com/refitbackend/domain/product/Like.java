package com.refitbackend.domain.product;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.refitbackend.domain.member.Member;


@Entity
@Table(name = "likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"member_id", "product_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Like {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private LocalDateTime likedAt;

    @PrePersist
    public void onLike() {
        this.likedAt = LocalDateTime.now();
    }
}
