package com.refitbackend.repository.board;

import com.refitbackend.domain.board.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 게시글 ID로 댓글 목록 조회 (생성일 순으로 정렬)
    @Query("SELECT c FROM Comment c WHERE c.board.id = :boardId ORDER BY c.createdAt ASC")
    List<Comment> findByBoardIdOrderByCreatedAtAsc(Long boardId);
    
    // 게시글 ID로 댓글 목록 조회 (페이징)
    @Query("SELECT c FROM Comment c WHERE c.board.id = :boardId ORDER BY c.createdAt ASC")
    Page<Comment> findByBoardIdOrderByCreatedAtAsc(Long boardId, Pageable pageable);

    // 게시글 ID로 댓글 개수 조회
    long countByBoardId(Long boardId);

    // 게시글 삭제 시 관련 댓글도 삭제
    void deleteByBoardId(Long boardId);


} 