package com.refitbackend.service.board;

import com.refitbackend.dto.board.CommentRequestDTO;
import com.refitbackend.dto.board.CommentResponseDTO;
import com.refitbackend.dto.board.CommentPageResponseDTO;

import java.util.List;

public interface CommentService {

    // 댓글 목록 조회 (계층 구조)
    List<CommentResponseDTO> getCommentsByBoardId(Long boardId);
    
    // 댓글 목록 조회 (페이징)
    CommentPageResponseDTO getCommentsByBoardIdWithPaging(Long boardId, int page, int size);

    // 댓글 작성
    CommentResponseDTO createComment(Long boardId, CommentRequestDTO commentRequestDTO);

    // 댓글 수정
    CommentResponseDTO updateComment(Long boardId, Long commentId, CommentRequestDTO commentRequestDTO);

    // 댓글 삭제
    void deleteComment(Long boardId, Long commentId);

    // 게시글의 댓글 개수 조회
    long getCommentCountByBoardId(Long boardId);
} 