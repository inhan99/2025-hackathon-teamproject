package com.refitbackend.controller.board;

import com.refitbackend.dto.board.ReplyRequestDTO;
import com.refitbackend.dto.board.ReplyResponseDTO;
import com.refitbackend.dto.member.MemberDTO;
import com.refitbackend.service.board.ReplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/replies")
@RequiredArgsConstructor
public class ReplyController {

    private final ReplyService replyService;

    // 현재 로그인한 사용자 정보 가져오기
    private MemberDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof MemberDTO) {
            return (MemberDTO) authentication.getPrincipal();
        }
        throw new RuntimeException("로그인이 필요합니다.");
    }

    // 답글 생성
    @PostMapping
    public ResponseEntity<ReplyResponseDTO> createReply(@RequestBody ReplyRequestDTO replyRequestDTO) {
        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();
            System.out.println("[DEBUG] Current user nickname: " + currentUser.getNickname());
            
            // writer를 현재 사용자의 nickname으로 설정
            replyRequestDTO.setWriter(currentUser.getNickname());
            
            ReplyResponseDTO createdReply = replyService.createReply(replyRequestDTO);
            return ResponseEntity.ok(createdReply);
        } catch (Exception e) {
            System.out.println("[ERROR] createReply failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 특정 댓글의 모든 답글 조회
    @GetMapping("/comment/{commentId}")
    public ResponseEntity<List<ReplyResponseDTO>> getRepliesByCommentId(@PathVariable Long commentId) {
        List<ReplyResponseDTO> replies = replyService.getRepliesByCommentId(commentId);
        return ResponseEntity.ok(replies);
    }

    // 답글 수정
    @PutMapping("/{replyId}")
    public ResponseEntity<ReplyResponseDTO> updateReply(@PathVariable Long replyId,
                                                      @RequestBody ReplyRequestDTO replyRequestDTO) {
        try {
            // 현재 로그인한 사용자 정보 가져오기
            MemberDTO currentUser = getCurrentUser();
            System.out.println("[DEBUG] Current user nickname: " + currentUser.getNickname());
            
            // writer를 현재 사용자의 nickname으로 설정
            replyRequestDTO.setWriter(currentUser.getNickname());
            
            ReplyResponseDTO updatedReply = replyService.updateReply(replyId, replyRequestDTO);
            return ResponseEntity.ok(updatedReply);
        } catch (Exception e) {
            System.out.println("[ERROR] updateReply failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 답글 삭제
    @DeleteMapping("/{replyId}")
    public ResponseEntity<Void> deleteReply(@PathVariable Long replyId) {
        replyService.deleteReply(replyId);
        return ResponseEntity.ok().build();
    }

    // 특정 댓글의 답글 개수 조회
    @GetMapping("/comment/{commentId}/count")
    public ResponseEntity<Long> getReplyCountByCommentId(@PathVariable Long commentId) {
        Long count = replyService.getReplyCountByCommentId(commentId);
        return ResponseEntity.ok(count);
    }
} 