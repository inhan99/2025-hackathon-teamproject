import React, { useEffect, useState } from "react";
import { getList } from "../../api/communityApi";
import { Link } from "react-router-dom";

const ListPage = () => {
  const [posts, setPosts] = useState([]);

  // 데이터 불러오기 함수 분리(등록 후 재호출 가능)
  const fetchPosts = async () => {
    const data = await getList();
    setPosts(data.dtoList);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="pt-52">
      <h2 className="text-2xl font-bold mb-4">커뮤니티 목록</h2>
      <Link
        to="/community/add"
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 inline-block"
      >
        글쓰기
      </Link>
      {posts.length === 0 ? (
        <p>게시글이 없습니다.</p>
      ) : (
        <ul>
          {posts.map(({ cno, title, writer, regDate, imageUrl }) => (
            <li
              key={cno}
              className="border-b py-3 flex justify-between items-center"
            >
              <Link
                to={`/community/read/${cno}`}
                className="font-semibold text-lg"
              >
                {title}
              </Link>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="첨부이미지"
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="text-sm text-gray-500">
                {writer} | {regDate}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListPage;
