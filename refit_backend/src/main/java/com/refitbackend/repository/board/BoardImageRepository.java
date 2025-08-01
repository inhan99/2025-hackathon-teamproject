package com.refitbackend.repository.board;

import com.refitbackend.domain.board.BoardImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardImageRepository extends JpaRepository<BoardImage, Long> {

    List<BoardImage> findByBoardId(Long boardId); // 게시글에 해당하는 이미지 리스트
}
