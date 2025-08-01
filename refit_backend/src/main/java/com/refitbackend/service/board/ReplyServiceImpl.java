package com.refitbackend.service.board;

import com.refitbackend.domain.board.Board;
import com.refitbackend.domain.board.Comment;
import com.refitbackend.domain.board.Reply;
import com.refitbackend.dto.board.ReplyRequestDTO;
import com.refitbackend.dto.board.ReplyResponseDTO;
import com.refitbackend.repository.board.BoardRepository;
import com.refitbackend.repository.board.CommentRepository;
import com.refitbackend.repository.board.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReplyServiceImpl implements ReplyService {

    private final ReplyRepository replyRepository;
    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;

    @Override
    public ReplyResponseDTO createReply(ReplyRequestDTO replyRequestDTO) {
        Board board = boardRepository.findById(replyRequestDTO.getBoardId())
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        Comment comment = commentRepository.findById(replyRequestDTO.getCommentId())
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        Reply reply = Reply.builder()
                .content(replyRequestDTO.getContent())
                .writer(replyRequestDTO.getWriter())
                .board(board)
                .comment(comment)
                .build();

        Reply savedReply = replyRepository.save(reply);
        return convertToDTO(savedReply);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReplyResponseDTO> getRepliesByCommentId(Long commentId) {
        List<Reply> replies = replyRepository.findByCommentIdOrderByCreatedAtAsc(commentId);
        return replies.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ReplyResponseDTO updateReply(Long replyId, ReplyRequestDTO replyRequestDTO) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("답글을 찾을 수 없습니다."));

        reply.setContent(replyRequestDTO.getContent());
        reply.setWriter(replyRequestDTO.getWriter());

        Reply updatedReply = replyRepository.save(reply);
        return convertToDTO(updatedReply);
    }

    @Override
    public void deleteReply(Long replyId) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("답글을 찾을 수 없습니다."));

        replyRepository.delete(reply);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getReplyCountByCommentId(Long commentId) {
        return replyRepository.countByCommentId(commentId);
    }

    private ReplyResponseDTO convertToDTO(Reply reply) {
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