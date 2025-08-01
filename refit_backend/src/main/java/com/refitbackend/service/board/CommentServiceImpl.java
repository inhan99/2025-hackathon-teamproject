package com.refitbackend.service.board;

import com.refitbackend.domain.board.Board;
import com.refitbackend.domain.board.Comment;
import com.refitbackend.domain.board.Reply;
import com.refitbackend.dto.board.CommentRequestDTO;
import com.refitbackend.dto.board.CommentResponseDTO;
import com.refitbackend.dto.board.CommentPageResponseDTO;
import com.refitbackend.dto.board.ReplyResponseDTO;
import com.refitbackend.repository.board.BoardRepository;
import com.refitbackend.repository.board.CommentRepository;
import com.refitbackend.repository.board.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final ReplyRepository replyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getCommentsByBoardId(Long boardId) {
        // 모든 댓글을 조회 (parent 정보 포함)
        List<Comment> allComments = commentRepository.findByBoardIdOrderByCreatedAtAsc(boardId);
        System.out.println("[DEBUG] getCommentsByBoardId - 총 댓글 수: " + allComments.size());
        
        return allComments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CommentResponseDTO createComment(Long boardId, CommentRequestDTO commentRequestDTO) {
        System.out.println("[DEBUG] CommentServiceImpl.createComment called");
        System.out.println("[DEBUG] boardId: " + boardId);
        System.out.println("[DEBUG] commentRequestDTO: " + commentRequestDTO);
        
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        Comment comment = Comment.builder()
                .content(commentRequestDTO.getContent())
                .writer(commentRequestDTO.getWriter())
                .board(board)
                .build();

        Comment savedComment = commentRepository.save(comment);
        System.out.println("[DEBUG] Comment saved with ID: " + savedComment.getId());
        
        return convertToDTO(savedComment);
    }

    @Override
    public CommentResponseDTO updateComment(Long boardId, Long commentId, CommentRequestDTO commentRequestDTO) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        // 게시글 ID 확인
        if (!comment.getBoard().getId().equals(boardId)) {
            throw new IllegalArgumentException("잘못된 게시글 ID입니다.");
        }

        comment.setContent(commentRequestDTO.getContent());
        Comment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    @Override
    public void deleteComment(Long boardId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        // 게시글 ID 확인
        if (!comment.getBoard().getId().equals(boardId)) {
            throw new IllegalArgumentException("잘못된 게시글 ID입니다.");
        }

        commentRepository.delete(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public long getCommentCountByBoardId(Long boardId) {
        return commentRepository.countByBoardId(boardId);
    }

    @Override
    @Transactional(readOnly = true)
    public CommentPageResponseDTO getCommentsByBoardIdWithPaging(Long boardId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentPage = commentRepository.findByBoardIdOrderByCreatedAtAsc(boardId, pageable);
        
        List<CommentResponseDTO> comments = commentPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return CommentPageResponseDTO.builder()
                .comments(comments)
                .currentPage(commentPage.getNumber())
                .totalPages(commentPage.getTotalPages())
                .totalElements(commentPage.getTotalElements())
                .size(commentPage.getSize())
                .hasNext(commentPage.hasNext())
                .hasPrevious(commentPage.hasPrevious())
                .build();
    }

    private CommentResponseDTO convertToDTO(Comment comment) {
        System.out.println("[DEBUG] convertToDTO - comment ID: " + comment.getId());
        
        // 답글 목록과 개수 조회
        List<ReplyResponseDTO> replies = replyRepository.findByCommentIdOrderByCreatedAtAsc(comment.getId())
                .stream()
                .map(this::convertReplyToDTO)
                .collect(Collectors.toList());
        
        Long replyCount = replyRepository.countByCommentId(comment.getId());
        
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .writer(comment.getWriter())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .boardId(comment.getBoard().getId())
                .replies(replies)
                .replyCount(replyCount)
                .build();
    }

    private ReplyResponseDTO convertReplyToDTO(Reply reply) {
        return ReplyResponseDTO.builder()
                .id(reply.getId())
                .content(reply.getContent())
                .writer(reply.getWriter())
                .boardId(reply.getBoard().getId())
                .commentId(reply.getComment().getId())
                .createdAt(reply.getCreatedAt())
                .updatedAt(reply.getUpdatedAt())
                .build();
    }


} 