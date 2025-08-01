package com.refitbackend.repository.board;

import com.refitbackend.domain.board.Reply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReplyRepository extends JpaRepository<Reply, Long> {

    // 특정 게시글의 모든 답글 조회
    List<Reply> findByBoardIdOrderByCreatedAtAsc(Long boardId);

    // 특정 댓글의 모든 답글 조회
    List<Reply> findByCommentIdOrderByCreatedAtAsc(Long commentId);

    // 특정 게시글의 답글 개수 조회
    @Query("SELECT COUNT(r) FROM Reply r WHERE r.board.id = :boardId")
    Long countByBoardId(@Param("boardId") Long boardId);

    // 특정 댓글의 답글 개수 조회
    @Query("SELECT COUNT(r) FROM Reply r WHERE r.comment.id = :commentId")
    Long countByCommentId(@Param("commentId") Long commentId);
} 