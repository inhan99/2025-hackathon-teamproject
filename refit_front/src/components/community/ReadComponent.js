import React from "react";

const ReadComponent = ({ post, onModify, onBack }) => {
  if (!post) return <div>로딩중...</div>;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
      <p className="mb-4">{post.content}</p>
      <p className="text-sm text-gray-500 mb-4">
        작성자: {post.writer} | 작성일: {post.regDate}
      </p>
      <button
        onClick={() => onModify(post.cno)}
        className="mr-2 bg-yellow-400 px-4 py-2 rounded"
      >
        수정
      </button>
      <button onClick={onBack} className="bg-gray-300 px-4 py-2 rounded">
        목록으로
      </button>
    </div>
  );
};

export default ReadComponent;
