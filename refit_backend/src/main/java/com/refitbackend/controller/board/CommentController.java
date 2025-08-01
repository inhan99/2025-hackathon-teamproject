package com.refitbackend.controller.board;

import com.refitbackend.dto.board.CommentRequestDTO;
import com.refitbackend.dto.board.CommentResponseDTO;
import com.refitbackend.dto.board.CommentPageResponseDTO;
import com.refitbackend.dto.member.MemberDTO;
import com.refitbackend.service.board.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // 현재 로그인한 사용자 정보 가져오기
    private MemberDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof MemberDTO) {
            return (MemberDTO) authentication.getPrincipal();
        }
        throw new RuntimeException("로그인이 필요합니다.");
    }

    // ========== 일반 댓글 API ==========
    @GetMapping("/{boardType}/{boardId}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable String boardType, @PathVariable Long boardId) {
        List<CommentResponseDTO> comments = commentService.getCommentsByBoardId(boardId);
        return ResponseEntity.ok(comments);
    }
    
    // ========== 댓글 페이징 API ==========
    @GetMapping("/{boardType}/{boardId}/comments/paging")
    public ResponseEntity<CommentPageResponseDTO> getCommentsWithPaging(
            @PathVariable String boardType, 
            @PathVariable Long boardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        CommentPageResponseDTO commentPage = commentService.getCommentsByBoardIdWithPaging(boardId, page, size);
        return ResponseEntity.ok(commentPage);
    }

    @PostMapping("/{boardType}/{boardId}/comments")
    public ResponseEntity<CommentResponseDTO> createComment(
            @PathVariable String boardType, @PathVariable Long boardId,
            @RequestBody CommentRequestDTO commentRequestDTO) {
        
        System.out.println("[DEBUG] createComment called");
        System.out.println("[DEBUG] boardType: " + boardType);
        System.out.println("[DEBUG] boardId: " + boardId);
        System.out.println("[DEBUG] commentRequestDTO: " + commentRequestDTO);

        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();
            System.out.println("[DEBUG] Current user nickname: " + currentUser.getNickname());
            
            // writer를 현재 사용자의 nickname으로 설정
            commentRequestDTO.setWriter(currentUser.getNickname());
            
            CommentResponseDTO createdComment = commentService.createComment(boardId, commentRequestDTO);
            return ResponseEntity.ok(createdComment);
        } catch (Exception e) {
            System.out.println("[ERROR] createComment failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{boardType}/{boardId}/comments/{commentId}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable String boardType, @PathVariable Long boardId,
            @PathVariable Long commentId,
            @RequestBody CommentRequestDTO commentRequestDTO) {
        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();
            System.out.println("[DEBUG] Current user nickname: " + currentUser.getNickname());
            
            // writer를 현재 사용자의 nickname으로 설정
            commentRequestDTO.setWriter(currentUser.getNickname());
            
            CommentResponseDTO updatedComment = commentService.updateComment(boardId, commentId, commentRequestDTO);
            return ResponseEntity.ok(updatedComment);
        } catch (Exception e) {
            System.out.println("[ERROR] updateComment failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{boardType}/{boardId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String boardType, @PathVariable Long boardId,
            @PathVariable Long commentId) {
        commentService.deleteComment(boardId, commentId);
        return ResponseEntity.noContent().build();
    }


} 