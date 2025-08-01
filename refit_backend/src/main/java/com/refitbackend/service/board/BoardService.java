package com.refitbackend.service.board;

import com.refitbackend.dto.board.BoardRequestDTO;
import com.refitbackend.dto.board.BoardResponseDTO;
import com.refitbackend.dto.board.BoardPageResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BoardService {
    List<BoardResponseDTO> getAllBoards();
    List<BoardResponseDTO> getAllBoardsWithCommentCount(); // 댓글 개수 포함 게시글 목록
    List<BoardResponseDTO> getBoardsByType(String boardType);
    List<BoardResponseDTO> getBoardsByTypeWithCommentCount(String boardType);
    
    // 페이징 메서드들
    BoardPageResponseDTO getAllBoardsWithPaging(int page, int size);
    BoardPageResponseDTO getBoardsByTypeWithPaging(String boardType, int page, int size);
    BoardResponseDTO getBoardById(Long id);
    BoardResponseDTO getBoardByIdAndType(Long id, String boardType);
    BoardResponseDTO createBoard(BoardRequestDTO requestDTO, List<MultipartFile> images);
    BoardResponseDTO updateBoard(Long id, BoardRequestDTO requestDTO, List<MultipartFile> images);
    void deleteBoard(Long id);
    void deleteBoardByIdAndType(Long id, String boardType);
    void updateExistingBoardsCreatedAt();
}
