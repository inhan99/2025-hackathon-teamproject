package com.refitbackend.repository.board;

import com.refitbackend.domain.board.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BoardRepository extends JpaRepository<Board, Long> {

    @Query("SELECT DISTINCT b FROM Board b LEFT JOIN FETCH b.images")
    List<Board> findAllWithImages();
    
    // 최신순으로 정렬 (created_at 내림차순)
    List<Board> findAllByOrderByCreatedAtDesc();
    
    // 최신순으로 정렬 (페이징)
    Page<Board> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // 게시판 타입별 조회 (최신순)
    List<Board> findByBoardTypeOrderByCreatedAtDesc(String boardType);
    
    // 게시판 타입별 조회 (페이징)
    Page<Board> findByBoardTypeOrderByCreatedAtDesc(String boardType, Pageable pageable);
    
    // 게시판 타입별 조회 (ID로)
    Board findByIdAndBoardType(Long id, String boardType);
}