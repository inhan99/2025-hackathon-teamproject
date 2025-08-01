package com.refitbackend.domain.board;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "board_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl; // 실제 이미지 파일이 저장된 경로 또는 URL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;
}
