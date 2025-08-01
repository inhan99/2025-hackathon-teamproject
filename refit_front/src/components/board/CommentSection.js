import React, { useState, useEffect } from "react";
import {
  fetchCommentsByType,
  createCommentByType,
  updateCommentByType,
  deleteCommentByType,
  createReply,
  updateReply,
  deleteReply,
  fetchRepliesByCommentId,
} from "../../api/boardApi";
import CommentItem from "./CommentItem";
import ReplyItem from "./ReplyItem";
import useCustomLogin from "../../hooks/UseCustomLogin";

const CommentSection = ({ postId, boardType = "freedom" }) => {
  // 로그인 상태 가져오기
  const { loginState, isLogin } = useCustomLogin();

  // 상태 변수 정리
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [replies, setReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 현재 사용자 닉네임 가져오기 (비밀게시판은 항상 "익"으로 고정)
  const currentUserIcon =
    boardType === "secret"
      ? "익"
      : loginState.member?.nickname?.charAt(0) || "익";

  // 댓글 목록 불러오기 (게시글과 동일한 방식: 10개 초과 시 페이징)
  const loadComments = async (page = 0) => {
    try {
      // 모든 댓글을 한 번에 가져와서 클라이언트에서 페이징 처리
      const response = await fetchCommentsByType(boardType, postId, 0, 1000);

      // 백엔드에서 페이징 응답 구조 확인
      let allComments = [];

      if (response.data && response.data.comments) {
        allComments = response.data.comments;
      } else if (response.data && response.data.content) {
        allComments = response.data.content;
      } else if (Array.isArray(response.data)) {
        allComments = response.data;
      }

      // 전체 댓글을 최신순으로 정렬
      const sortedAllComments = allComments.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // 최신이 위로
      });

      // 클라이언트에서 페이징 처리
      const pageSize = 10;
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPageComments = sortedAllComments.slice(startIndex, endIndex);

      setComments(currentPageComments);
      setCurrentPage(page);
      setTotalPages(Math.ceil(sortedAllComments.length / pageSize));
      setTotalElements(sortedAllComments.length);

      // 각 댓글의 답글 개수 확인 (답글은 페이징 없음)
      currentPageComments.forEach(async (comment) => {
        try {
          const replyCountResponse = await fetchRepliesByCommentId(comment.id);
          // 답글도 최신 순으로 정렬
          const sortedReplies = (replyCountResponse.data || []).sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA; // 최신이 위로
          });
          setReplies((prev) => ({
            ...prev,
            [comment.id]: sortedReplies,
          }));
        } catch (error) {
          console.error(`댓글 ${comment.id}의 답글 불러오기 실패:`, error);
          setReplies((prev) => ({
            ...prev,
            [comment.id]: [],
          }));
        }
      });
    } catch (error) {
      console.error("댓글 불러오기 실패:", error);
      setComments([]);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId, boardType]);

  // 댓글 작성
  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await createCommentByType(boardType, postId, {
        content: newComment,
        writer: "익명",
      });
      setNewComment("");
      await loadComments(currentPage);
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 답글 작성 시작
  const handleStartReply = (comment) => {
    setReplyingTo(comment.id);
    setNewReply("");
  };

  // 답글 작성 취소
  const handleCancelReply = () => {
    setReplyingTo(null);
    setNewReply("");
  };

  // 답글 작성 완료
  const handleSubmitReply = async (commentId) => {
    if (!newReply.trim()) return;

    try {
      await createReply({
        content: newReply,
        writer: "익명",
        boardId: postId,
        commentId: commentId,
      });

      setReplyingTo(null);
      setNewReply("");
      loadComments(currentPage); // 댓글 목록 새로고침
    } catch (error) {
      console.error("답글 작성 실패:", error);
      alert("답글 작성에 실패했습니다.");
    }
  };

  // 답글 수정 핸들러
  const handleUpdateReply = async (replyId, commentId, content) => {
    try {
      await updateReply(replyId, {
        content: content,
        writer: "익명",
        boardId: postId,
        commentId: commentId,
      });
      loadComments(currentPage);
    } catch (error) {
      console.error("답글 수정 실패:", error);
      alert("답글 수정에 실패했습니다.");
    }
  };

  // 답글 삭제 핸들러
  const handleDeleteReply = async (replyId) => {
    try {
      await deleteReply(replyId);
      loadComments(currentPage);
    } catch (error) {
      console.error("답글 삭제 실패:", error);
      alert("답글 삭제에 실패했습니다.");
    }
  };

  // 답글 토글
  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // 댓글 수정 핸들러
  const handleUpdateComment = async (commentId, content) => {
    try {
      await updateCommentByType(boardType, postId, commentId, {
        content: content,
      });
      loadComments(currentPage);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteCommentByType(boardType, postId, commentId);
      loadComments(currentPage);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">
          댓글 (
          {totalElements > 0
            ? totalElements
            : Array.isArray(comments)
            ? comments.length
            : 0}
          )
        </h3>

        {/* 댓글 작성 폼 - 로그인한 사용자만 보이기 */}
        {isLogin && (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {currentUserIcon}
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  disabled={loading}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={loading || !newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? "작성 중..." : "댓글 작성"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {Array.isArray(comments) &&
            comments.map((comment) => {
              const hasReplies =
                replies[comment.id] && replies[comment.id].length > 0;
              const isShowingReplies = showReplies[comment.id];

              return (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  boardType={boardType}
                  onUpdate={handleUpdateComment}
                  onDelete={handleDeleteComment}
                  onStartReply={handleStartReply}
                  hasReplies={hasReplies}
                  isShowingReplies={isShowingReplies}
                  onToggleReplies={toggleReplies}
                  replyingTo={replyingTo}
                  onReplySubmit={handleSubmitReply}
                  onReplyCancel={handleCancelReply}
                  newReply={newReply}
                  onReplyChange={setNewReply}
                  replies={replies[comment.id]}
                  ReplyItem={ReplyItem}
                  onUpdateReply={handleUpdateReply}
                  onDeleteReply={handleDeleteReply}
                />
              );
            })}
        </div>

        {/* 페이징 UI */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => loadComments(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => loadComments(i)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === i
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => loadComments(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
