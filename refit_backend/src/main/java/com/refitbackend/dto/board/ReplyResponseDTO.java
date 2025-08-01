package com.refitbackend.dto.board;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyResponseDTO {

    private Long id;
    private String content;
    private String writer;
    private Long boardId;
    private Long commentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 