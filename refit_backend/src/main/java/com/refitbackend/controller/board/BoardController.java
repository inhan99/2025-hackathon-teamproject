package com.refitbackend.controller.board;

import com.refitbackend.dto.board.BoardRequestDTO;
import com.refitbackend.dto.board.BoardResponseDTO;
import com.refitbackend.dto.board.BoardPageResponseDTO;
import com.refitbackend.dto.member.MemberDTO;
import com.refitbackend.service.board.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    // 현재 로그인한 사용자 정보 가져오기
    private MemberDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof MemberDTO) {
            return (MemberDTO) authentication.getPrincipal();
        }
        throw new RuntimeException("로그인이 필요합니다.");
    }

    // 게시글 목록 조회
    @GetMapping
    public ResponseEntity<List<BoardResponseDTO>> getAllBoards() {
        List<BoardResponseDTO> boards = boardService.getAllBoards();
        return ResponseEntity.ok(boards);
    }

    // 댓글 개수 포함 게시글 목록 조회
    @GetMapping("/with-comments")
    public ResponseEntity<List<BoardResponseDTO>> getAllBoardsWithCommentCount() {
        List<BoardResponseDTO> boards = boardService.getAllBoardsWithCommentCount();
        return ResponseEntity.ok(boards);
    }
    
    // 페이징 게시글 목록 조회
    @GetMapping("/list/paging")
    public ResponseEntity<BoardPageResponseDTO> getAllBoardsWithPaging(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        BoardPageResponseDTO boardPage = boardService.getAllBoardsWithPaging(page, size);
        return ResponseEntity.ok(boardPage);
    }

    // 게시판 타입별 게시글 목록 조회
    @GetMapping("/{boardType}")
    public ResponseEntity<List<BoardResponseDTO>> getBoardsByType(@PathVariable String boardType) {
        List<BoardResponseDTO> boards = boardService.getBoardsByType(boardType);
        return ResponseEntity.ok(boards);
    }

    // 게시판 타입별 댓글 개수 포함 게시글 목록 조회
    @GetMapping("/{boardType}/with-comments")
    public ResponseEntity<List<BoardResponseDTO>> getBoardsByTypeWithCommentCount(@PathVariable String boardType) {
        List<BoardResponseDTO> boards = boardService.getBoardsByTypeWithCommentCount(boardType);
        return ResponseEntity.ok(boards);
    }
    
    // 게시판 타입별 페이징 게시글 목록 조회
    @GetMapping("/{boardType}/list/paging")
    public ResponseEntity<BoardPageResponseDTO> getBoardsByTypeWithPaging(
            @PathVariable String boardType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        BoardPageResponseDTO boardPage = boardService.getBoardsByTypeWithPaging(boardType, page, size);
        return ResponseEntity.ok(boardPage);
    }

    // 게시글 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<BoardResponseDTO> getBoardById(@PathVariable Long id) {
        BoardResponseDTO board = boardService.getBoardById(id);
        return ResponseEntity.ok(board);
    }

    // 게시판 타입별 게시글 상세 조회
    @GetMapping("/{boardType}/{id}")
    public ResponseEntity<BoardResponseDTO> getBoardByIdAndType(@PathVariable String boardType, @PathVariable Long id) {
        BoardResponseDTO board = boardService.getBoardByIdAndType(id, boardType);
        return ResponseEntity.ok(board);
    }

    // 게시글 작성
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<BoardResponseDTO> createBoard(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "boardType", required = false) String boardType,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        System.out.println("[DEBUG] createBoard() called");
        System.out.println("[DEBUG] Title: " + title);
        System.out.println("[DEBUG] Content: " + content);
        System.out.println("[DEBUG] Images count: " + (images != null ? images.size() : 0));

        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();
            System.out.println("[DEBUG] Current user: " + currentUser.getEmail());

            // null 체크
            if (title == null || title.trim().isEmpty()) {
                System.out.println("[ERROR] Title is null or empty");
                return ResponseEntity.badRequest().body(null);
            }
            if (content == null || content.trim().isEmpty()) {
                System.out.println("[ERROR] Content is null or empty");
                return ResponseEntity.badRequest().body(null);
            }

            BoardRequestDTO boardRequestDTO = BoardRequestDTO.builder()
                    .title(title)
                    .content(content)
                    .memberEmail(currentUser.getEmail())
                    .boardType(boardType)
                    .build();

            System.out.println("[DEBUG] BoardRequestDTO created: " + boardRequestDTO);

            BoardResponseDTO responseDTO = boardService.createBoard(boardRequestDTO, images);
            System.out.println("[DEBUG] Board created successfully: " + responseDTO.getId());
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.out.println("[ERROR] createBoard failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 게시글 수정
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<BoardResponseDTO> updateBoard(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "boardType", required = false) String boardType,
            @RequestParam(value = "existingImages", required = false) List<String> existingImages,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        System.out.println("[DEBUG] updateBoard() called - ID: " + id);
        System.out.println("[DEBUG] Existing images: " + existingImages);

        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();

            BoardRequestDTO boardRequestDTO = BoardRequestDTO.builder()
                    .title(title)
                    .content(content)
                    .memberEmail(currentUser.getEmail())
                    .boardType(boardType)
                    .existingImages(existingImages)
                    .build();

            BoardResponseDTO responseDTO = boardService.updateBoard(id, boardRequestDTO, images);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.out.println("[ERROR] updateBoard failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }

    // 게시판 타입별 게시글 삭제
    @DeleteMapping("/{boardType}/{id}")
    public ResponseEntity<Void> deleteBoardByIdAndType(@PathVariable String boardType, @PathVariable Long id) {
        boardService.deleteBoardByIdAndType(id, boardType);
        return ResponseEntity.noContent().build();
    }

    // ========== 자유게시판 API ==========
    @GetMapping("/freedom")
    public ResponseEntity<List<BoardResponseDTO>> getFreedomBoards() {
        List<BoardResponseDTO> boards = boardService.getBoardsByType("freedom");
        return ResponseEntity.ok(boards);
    }

    @PostMapping(value = "/freedom", consumes = {"multipart/form-data"})
    public ResponseEntity<BoardResponseDTO> createFreedomBoard(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        
        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();
            
            BoardRequestDTO boardRequestDTO = BoardRequestDTO.builder()
                    .title(title)
                    .content(content)
                    .memberEmail(currentUser.getEmail())
                    .boardType("freedom")
                    .build();

            BoardResponseDTO responseDTO = boardService.createBoard(boardRequestDTO, images);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.out.println("[ERROR] createFreedomBoard failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/freedom/{id}")
    public ResponseEntity<BoardResponseDTO> getFreedomBoardById(@PathVariable Long id) {
        BoardResponseDTO board = boardService.getBoardByIdAndType(id, "freedom");
        return ResponseEntity.ok(board);
    }

    @PutMapping(value = "/freedom/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<BoardResponseDTO> updateFreedomBoard(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "existingImages", required = false) List<String> existingImages,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();

            BoardRequestDTO boardRequestDTO = BoardRequestDTO.builder()
                    .title(title)
                    .content(content)
                    .memberEmail(currentUser.getEmail())
                    .boardType("freedom")
                    .existingImages(existingImages)
                    .build();

            BoardResponseDTO responseDTO = boardService.updateBoard(id, boardRequestDTO, images);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.out.println("[ERROR] updateFreedomBoard failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/freedom/{id}")
    public ResponseEntity<Void> deleteFreedomBoard(@PathVariable Long id) {
        boardService.deleteBoardByIdAndType(id, "freedom");
        return ResponseEntity.noContent().build();
    }

    // ========== 비밀게시판 API ==========
    @GetMapping("/secret")
    public ResponseEntity<List<BoardResponseDTO>> getSecretBoards() {
        List<BoardResponseDTO> boards = boardService.getBoardsByType("secret");
        return ResponseEntity.ok(boards);
    }

    @PostMapping(value = "/secret", consumes = {"multipart/form-data"})
    public ResponseEntity<BoardResponseDTO> createSecretBoard(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        
        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();
            
            BoardRequestDTO boardRequestDTO = BoardRequestDTO.builder()
                    .title(title)
                    .content(content)
                    .memberEmail(currentUser.getEmail())
                    .boardType("secret")
                    .build();

            BoardResponseDTO responseDTO = boardService.createBoard(boardRequestDTO, images);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.out.println("[ERROR] createSecretBoard failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/secret/{id}")
    public ResponseEntity<BoardResponseDTO> getSecretBoardById(@PathVariable Long id) {
        BoardResponseDTO board = boardService.getBoardByIdAndType(id, "secret");
        return ResponseEntity.ok(board);
    }

    @PutMapping(value = "/secret/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<BoardResponseDTO> updateSecretBoard(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "existingImages", required = false) List<String> existingImages,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();

            BoardRequestDTO boardRequestDTO = BoardRequestDTO.builder()
                    .title(title)
                    .content(content)
                    .memberEmail(currentUser.getEmail())
                    .boardType("secret")
                    .existingImages(existingImages)
                    .build();

            BoardResponseDTO responseDTO = boardService.updateBoard(id, boardRequestDTO, images);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.out.println("[ERROR] updateSecretBoard failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/secret/{id}")
    public ResponseEntity<Void> deleteSecretBoard(@PathVariable Long id) {
        boardService.deleteBoardByIdAndType(id, "secret");
        return ResponseEntity.noContent().build();
    }

    // ========== 나눔게시판 API ==========
    @GetMapping("/share")
    public ResponseEntity<List<BoardResponseDTO>> getShareBoards() {
        List<BoardResponseDTO> boards = boardService.getBoardsByType("share");
        return ResponseEntity.ok(boards);
    }

    @PostMapping(value = "/share", consumes = {"multipart/form-data"})
    public ResponseEntity<BoardResponseDTO> createShareBoard(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        
        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();
            
            BoardRequestDTO boardRequestDTO = BoardRequestDTO.builder()
                    .title(title)
                    .content(content)
                    .memberEmail(currentUser.getEmail())
                    .boardType("share")
                    .build();

            BoardResponseDTO responseDTO = boardService.createBoard(boardRequestDTO, images);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.out.println("[ERROR] createShareBoard failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/share/{id}")
    public ResponseEntity<BoardResponseDTO> getShareBoardById(@PathVariable Long id) {
        BoardResponseDTO board = boardService.getBoardByIdAndType(id, "share");
        return ResponseEntity.ok(board);
    }

    @PutMapping(value = "/share/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<BoardResponseDTO> updateShareBoard(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "existingImages", required = false) List<String> existingImages,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();

            BoardRequestDTO boardRequestDTO = BoardRequestDTO.builder()
                    .title(title)
                    .content(content)
                    .memberEmail(currentUser.getEmail())
                    .boardType("share")
                    .existingImages(existingImages)
                    .build();

            BoardResponseDTO responseDTO = boardService.updateBoard(id, boardRequestDTO, images);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.out.println("[ERROR] updateShareBoard failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/share/{id}")
    public ResponseEntity<Void> deleteShareBoard(@PathVariable Long id) {
        boardService.deleteBoardByIdAndType(id, "share");
        return ResponseEntity.noContent().build();
    }

    // 기존 게시글들의 createdAt 업데이트 (임시용)
    @PostMapping("/update-created-at")
    public ResponseEntity<String> updateExistingBoardsCreatedAt() {
        boardService.updateExistingBoardsCreatedAt();
        return ResponseEntity.ok("기존 게시글들의 생성 시간이 업데이트되었습니다.");
    }
}
