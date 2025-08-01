import React, { useState } from "react";
import { useSelector } from "react-redux";
import useCustomLogin from "../../hooks/UseCustomLogin";

const CommentItem = ({
  comment,
  boardType,
  onUpdate,
  onDelete,
  onStartReply,
  hasReplies,
  isShowingReplies,
  onToggleReplies,
  replyingTo,
  onReplySubmit,
  onReplyCancel,
  newReply,
  onReplyChange,
  replies,
  ReplyItem,
  onUpdateReply,
  onDeleteReply,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  // 로그인 상태 가져오기
  const { loginState, isLogin } = useCustomLogin();

  // 인증 상태 확인
  const auth = useSelector((state) => state.authSlice);
  const currentUser = auth && auth.member ? auth.member.username : null;
  const currentNickname = auth && auth.member ? auth.member.nickname : null;

  // 현재 사용자 아이콘 가져오기 (비밀게시판은 항상 "익"으로 고정)
  const currentUserIcon =
    boardType === "secret"
      ? "익"
      : loginState.member?.nickname?.charAt(0) || "익";

  // 댓글 작성자 여부 확인 (username과 nickname 모두 확인)
  const isCommentAuthor =
    comment &&
    (currentUser || currentNickname) &&
    (comment.writer === currentUser || comment.writer === currentNickname);

  // 디버깅용 로그
  console.log("🔍 댓글 디버깅 정보:", {
    auth,
    currentUser,
    currentNickname,
    commentWriter: comment?.writer,
    isCommentAuthor,
    comment: comment,
  });

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent("");
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;

    try {
      await onUpdate(comment.id, editContent);
      setIsEditing(false);
      setEditContent("");
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-3 bg-white">
      {/* 댓글 본문 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {boardType === "secret" ? "익" : comment.writer?.charAt(0) || "익"}
          </div>
          <span className="ml-2 font-medium text-gray-900">
            {boardType === "secret" ? "익명" : comment.writer}
          </span>
          <span className="text-sm text-gray-500">
            {comment.createdAt
              ? new Date(comment.createdAt).toLocaleString("ko-KR")
              : "시간 정보 없음"}
          </span>
        </div>
        {isCommentAuthor && (
          <div className="flex gap-2">
            <button
              onClick={handleStartEdit}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="text-sm text-red-600 hover:text-red-800"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              수정 완료
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-3">
            {comment.content}
          </p>

          {/* 답글 관련 버튼들 - 로그인한 사용자만 보이기 */}
          <div className="flex items-center gap-4 text-sm">
            {isLogin && (
              <button
                onClick={() => onStartReply(comment)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                답글
              </button>
            )}

            {hasReplies && (
              <button
                onClick={() => onToggleReplies(comment.id)}
                className="text-gray-600 hover:text-gray-800"
              >
                {isShowingReplies
                  ? "답글 숨기기"
                  : `답글 보기 (${replies?.length || 0})`}
              </button>
            )}
          </div>

          {/* 답글 작성 폼 - 로그인한 사용자만 보이기 */}
          {isLogin && replyingTo === comment.id && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex gap-2">
                <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {currentUserIcon}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newReply}
                    onChange={(e) => onReplyChange(e.target.value)}
                    placeholder="답글을 입력하세요..."
                    className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows="2"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => onReplySubmit(comment.id)}
                      disabled={!newReply.trim()}
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      답글 작성
                    </button>
                    <button
                      type="button"
                      onClick={onReplyCancel}
                      className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 답글 목록 */}
          {isShowingReplies && replies && (
            <div className="mt-3">
              {replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  commentId={comment.id}
                  boardType={boardType}
                  onUpdate={onUpdateReply}
                  onDelete={onDeleteReply}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentItem;
