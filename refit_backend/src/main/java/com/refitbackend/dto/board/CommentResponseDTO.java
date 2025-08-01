package com.refitbackend.dto.board;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponseDTO {

    private Long id;
    private String content;
    private String writer;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long boardId;
    private List<ReplyResponseDTO> replies; // 답글 목록
    private Long replyCount; // 답글 개수

} 