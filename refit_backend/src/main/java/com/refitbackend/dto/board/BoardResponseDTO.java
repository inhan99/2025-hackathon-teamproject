package com.refitbackend.dto.board;

import com.refitbackend.domain.board.Board;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardResponseDTO {
    private Long id;
    private String title;
    private String content;
    private String writer; // 기존 호환성을 위해 유지
    private String memberEmail; // 새로운 필드
    private String memberNickname; // 새로운 필드
    private String boardType; // "freedom", "secret", "share"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<BoardImageDTO> images;
    private Long commentCount; // 댓글 개수 필드 추가

    // 엔티티 -> DTO 변환
    public static BoardResponseDTO fromEntity(Board entity) {
        return BoardResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .writer(entity.getWriter()) // 기존 호환성
                .memberEmail(entity.getMember() != null ? entity.getMember().getEmail() : null)
                .memberNickname(entity.getMember() != null ? entity.getMember().getNickname() : null)
                .boardType(entity.getBoardType())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .images(entity.getImages().stream()
                        .map(BoardImageDTO::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }

    // 댓글 개수 포함 엔티티 -> DTO 변환
    public static BoardResponseDTO fromEntityWithCommentCount(Board entity, Long commentCount) {
        return BoardResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .writer(entity.getWriter()) // 기존 호환성
                .memberEmail(entity.getMember() != null ? entity.getMember().getEmail() : null)
                .memberNickname(entity.getMember() != null ? entity.getMember().getNickname() : null)
                .boardType(entity.getBoardType())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .images(entity.getImages().stream()
                        .map(BoardImageDTO::fromEntity)
                        .collect(Collectors.toList()))
                .commentCount(commentCount)
                .build();
    }
}
