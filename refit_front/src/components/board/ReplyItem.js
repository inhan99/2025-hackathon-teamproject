import React, { useState } from "react";
import { useSelector } from "react-redux";

const ReplyItem = ({ reply, commentId, boardType, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  // 인증 상태 확인
  const auth = useSelector((state) => state.authSlice);
  const currentUser = auth && auth.member ? auth.member.username : null;
  const currentNickname = auth && auth.member ? auth.member.nickname : null;

  // 답글 작성자 여부 확인 (username과 nickname 모두 확인)
  const isReplyAuthor =
    reply &&
    (currentUser || currentNickname) &&
    (reply.writer === currentUser || reply.writer === currentNickname);

  // 디버깅용 로그
  console.log("🔍 답글 디버깅 정보:", {
    auth,
    currentUser,
    currentNickname,
    replyWriter: reply?.writer,
    isReplyAuthor,
    reply: reply,
  });

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(reply.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent("");
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;

    try {
      await onUpdate(reply.id, commentId, editContent);
      setIsEditing(false);
      setEditContent("");
    } catch (error) {
      console.error("답글 수정 실패:", error);
      alert("답글 수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("답글을 삭제하시겠습니까?")) return;

    try {
      await onDelete(reply.id);
    } catch (error) {
      console.error("답글 삭제 실패:", error);
      alert("답글 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="ml-8 mt-3 p-3 bg-gray-50 rounded-lg border-l-2 border-blue-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {boardType === "secret" ? "익" : reply.writer?.charAt(0) || "익"}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {boardType === "secret" ? "익명" : reply.writer}
          </span>
          <span className="text-xs text-gray-500">
            {reply.createdAt
              ? new Date(reply.createdAt).toLocaleString("ko-KR")
              : "시간 정보 없음"}
          </span>
        </div>
        {isReplyAuthor && (
          <div className="flex gap-2">
            <button
              onClick={handleStartEdit}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-red-600 hover:text-red-800"
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
            className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows="2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUpdate}
              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
            >
              수정 완료
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {reply.content}
        </p>
      )}
    </div>
  );
};

export default ReplyItem;
