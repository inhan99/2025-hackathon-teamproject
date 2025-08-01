package com.refitbackend.dto.board;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyRequestDTO {

    private String content;
    private String writer;
    private Long boardId;
    private Long commentId; // 답글이 속한 댓글 ID
} 