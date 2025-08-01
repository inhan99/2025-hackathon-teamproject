package com.refitbackend.service.board;

import com.refitbackend.dto.board.ReplyRequestDTO;
import com.refitbackend.dto.board.ReplyResponseDTO;

import java.util.List;

public interface ReplyService {

    // 답글 생성
    ReplyResponseDTO createReply(ReplyRequestDTO replyRequestDTO);

    // 특정 댓글의 모든 답글 조회
    List<ReplyResponseDTO> getRepliesByCommentId(Long commentId);

    // 답글 수정
    ReplyResponseDTO updateReply(Long replyId, ReplyRequestDTO replyRequestDTO);

    // 답글 삭제
    void deleteReply(Long replyId);

    // 특정 댓글의 답글 개수 조회
    Long getReplyCountByCommentId(Long commentId);
} 