package com.refitbackend.domain.board;

import com.refitbackend.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "boards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String writer;

    @Column(name = "board_type", nullable = false)
    private String boardType; // "freedom", "secret", "share"

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default // 👉 Builder 사용할 때 기본값 보장
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardImage> images = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    // Member와의 연관관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_email")
    private Member member;

    // 연관관계 편의 메서드
    public void addImage(BoardImage image) {
        image.setBoard(this); // 양방향 설정
        this.images.add(image);
    }

    public void addComment(Comment comment) {
        comment.setBoard(this); // 양방향 설정
        this.comments.add(comment);
    }

    public void setMember(Member member) {
        this.member = member;
    }
}
