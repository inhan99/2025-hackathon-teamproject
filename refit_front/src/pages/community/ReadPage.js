import React, { useEffect, useState } from "react";
import { getOne, deleteOne } from "../../api/communityApi";
import { useParams, useNavigate, Link } from "react-router-dom";

const ReadPage = () => {
  const { cno } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    getOne(cno).then(setPost);
  }, [cno]);

  if (!post) return <div>로딩중...</div>;

  const handleDelete = async () => {
    await deleteOne(cno);
    navigate("/community");
  };

  return (
    <div className="p-4 pt-52">
      <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
      <p>{post.content}</p>
      <div className="text-sm text-gray-500 mt-2">
        작성자: {post.writer} / 작성일: {post.regDate}
      </div>

      {post.imageFile && (
        <div className="mt-2 text-sm text-gray-400">
          첨부된 이미지: {post.imageFile}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Link
          to={`/community/modify/${cno}`}
          className="bg-yellow-400 px-4 py-2 rounded"
        >
          수정
        </Link>
        <button
          onClick={handleDelete}
          className="bg-red-500 px-4 py-2 rounded text-white"
        >
          삭제
        </button>
        <button
          onClick={() => navigate("/community")}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          목록으로
        </button>
      </div>
    </div>
  );
};

export default ReadPage;
