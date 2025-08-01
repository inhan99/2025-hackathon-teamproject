package com.refitbackend.service.board;

import com.refitbackend.domain.board.Board;
import com.refitbackend.domain.board.BoardImage;
import com.refitbackend.domain.member.Member;
import com.refitbackend.dto.board.BoardRequestDTO;
import com.refitbackend.dto.board.BoardResponseDTO;
import com.refitbackend.dto.board.BoardPageResponseDTO;
import com.refitbackend.repository.board.BoardRepository;
import com.refitbackend.repository.board.CommentRepository;
import com.refitbackend.repository.member.MemberRepository;
import com.refitbackend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;
    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;
    private final FileStorageService fileStorageService;

    @Override
    public List<BoardResponseDTO> getAllBoards() {
        List<Board> boards = boardRepository.findAllByOrderByCreatedAtDesc();
        return boards.stream()
                .map(BoardResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<BoardResponseDTO> getAllBoardsWithCommentCount() {
        List<Board> boards = boardRepository.findAllByOrderByCreatedAtDesc();
        return boards.stream()
                .map(board -> {
                    Long commentCount = commentRepository.countByBoardId(board.getId());
                    return BoardResponseDTO.fromEntityWithCommentCount(board, commentCount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<BoardResponseDTO> getBoardsByType(String boardType) {
        List<Board> boards = boardRepository.findByBoardTypeOrderByCreatedAtDesc(boardType);
        return boards.stream()
                .map(BoardResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<BoardResponseDTO> getBoardsByTypeWithCommentCount(String boardType) {
        List<Board> boards = boardRepository.findByBoardTypeOrderByCreatedAtDesc(boardType);
        return boards.stream()
                .map(board -> {
                    Long commentCount = commentRepository.countByBoardId(board.getId());
                    return BoardResponseDTO.fromEntityWithCommentCount(board, commentCount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public BoardResponseDTO getBoardById(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + id));
        return BoardResponseDTO.fromEntity(board);
    }

    @Override
    public BoardResponseDTO getBoardByIdAndType(Long id, String boardType) {
        Board board = boardRepository.findByIdAndBoardType(id, boardType);
        if (board == null) {
            throw new IllegalArgumentException("게시글이 없습니다. id=" + id + ", boardType=" + boardType);
        }
        return BoardResponseDTO.fromEntity(board);
    }

    @Override
    public BoardResponseDTO createBoard(BoardRequestDTO requestDTO, List<MultipartFile> images) {
        // Member 정보 조회
        Member member = memberRepository.findById(requestDTO.getMemberEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다. email=" + requestDTO.getMemberEmail()));

        LocalDateTime now = LocalDateTime.now();
        Board board = Board.builder()
                .title(requestDTO.getTitle())
                .content(requestDTO.getContent())
                .writer(member.getNickname()) // writer는 nickname으로 설정
                .boardType(requestDTO.getBoardType())
                .createdAt(now)
                .updatedAt(now)
                .build();

        // Member 연관관계 설정
        board.setMember(member);

        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                String imageUrl = fileStorageService.storeFile(image);
                BoardImage boardImage = BoardImage.builder()
                        .imageUrl(imageUrl)
                        .board(board)
                        .build();
                board.addImage(boardImage);
            }
        }

        Board savedBoard = boardRepository.save(board);
        return BoardResponseDTO.fromEntity(savedBoard);
    }

    @Override
    public BoardResponseDTO updateBoard(Long id, BoardRequestDTO requestDTO, List<MultipartFile> images) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + id));

        // Member 정보 조회 (수정 시에도 member 정보 필요)
        Member member = memberRepository.findById(requestDTO.getMemberEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다. email=" + requestDTO.getMemberEmail()));

        board.setTitle(requestDTO.getTitle());
        board.setContent(requestDTO.getContent());
        board.setWriter(member.getNickname()); // writer는 nickname으로 설정
        board.setUpdatedAt(LocalDateTime.now());

        board.getImages().clear();

        // 기존 이미지 처리
        if (requestDTO.getExistingImages() != null && !requestDTO.getExistingImages().isEmpty()) {
            for (String imageUrl : requestDTO.getExistingImages()) {
                BoardImage boardImage = BoardImage.builder()
                        .imageUrl(imageUrl)
                        .board(board)
                        .build();
                board.addImage(boardImage);
            }
        }

        // 새 이미지 처리
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                String imageUrl = fileStorageService.storeFile(image);
                BoardImage boardImage = BoardImage.builder()
                        .imageUrl(imageUrl)
                        .board(board)
                        .build();
                board.addImage(boardImage);
            }
        }

        Board updatedBoard = boardRepository.save(board);
        return BoardResponseDTO.fromEntity(updatedBoard);
    }

    @Override
    public void deleteBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + id));

        // 게시글 삭제 시 관련 댓글도 삭제
        commentRepository.deleteByBoardId(id);

        if (board.getImages() != null) {
            for (BoardImage img : board.getImages()) {
                fileStorageService.deleteFile(img.getImageUrl());
            }
        }

        boardRepository.delete(board);
    }

    @Override
    public void deleteBoardByIdAndType(Long id, String boardType) {
        Board board = boardRepository.findByIdAndBoardType(id, boardType);
        if (board == null) {
            throw new IllegalArgumentException("게시글이 없습니다. id=" + id + ", boardType=" + boardType);
        }

        // 게시글 삭제 시 관련 댓글도 삭제
        commentRepository.deleteByBoardId(id);

        if (board.getImages() != null) {
            for (BoardImage img : board.getImages()) {
                fileStorageService.deleteFile(img.getImageUrl());
            }
        }

        boardRepository.delete(board);
    }

    @Override
    public void updateExistingBoardsCreatedAt() {
        List<Board> boards = boardRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        for (Board board : boards) {
            if (board.getCreatedAt() == null) {
                board.setCreatedAt(now);
                boardRepository.save(board);
            }
            // 기존 게시글들의 boardType을 'freedom'으로 설정
            if (board.getBoardType() == null) {
                board.setBoardType("freedom");
                boardRepository.save(board);
            }
        }
    }

    @Override
    public BoardPageResponseDTO getAllBoardsWithPaging(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Board> boardPage = boardRepository.findAllByOrderByCreatedAtDesc(pageable);
        
        List<BoardResponseDTO> boards = boardPage.getContent().stream()
                .map(board -> {
                    Long commentCount = commentRepository.countByBoardId(board.getId());
                    return BoardResponseDTO.fromEntityWithCommentCount(board, commentCount);
                })
                .collect(Collectors.toList());
        
        return BoardPageResponseDTO.builder()
                .boards(boards)
                .currentPage(boardPage.getNumber())
                .totalPages(boardPage.getTotalPages())
                .totalElements(boardPage.getTotalElements())
                .size(boardPage.getSize())
                .hasNext(boardPage.hasNext())
                .hasPrevious(boardPage.hasPrevious())
                .build();
    }

    @Override
    public BoardPageResponseDTO getBoardsByTypeWithPaging(String boardType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Board> boardPage = boardRepository.findByBoardTypeOrderByCreatedAtDesc(boardType, pageable);
        
        List<BoardResponseDTO> boards = boardPage.getContent().stream()
                .map(board -> {
                    Long commentCount = commentRepository.countByBoardId(board.getId());
                    return BoardResponseDTO.fromEntityWithCommentCount(board, commentCount);
                })
                .collect(Collectors.toList());
        
        return BoardPageResponseDTO.builder()
                .boards(boards)
                .currentPage(boardPage.getNumber())
                .totalPages(boardPage.getTotalPages())
                .totalElements(boardPage.getTotalElements())
                .size(boardPage.getSize())
                .hasNext(boardPage.hasNext())
                .hasPrevious(boardPage.hasPrevious())
                .build();
    }

    @PostConstruct
    public void initializeCreatedAt() {
        updateExistingBoardsCreatedAt();
    }
}
