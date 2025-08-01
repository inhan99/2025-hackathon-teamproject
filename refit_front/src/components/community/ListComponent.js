import React from "react";

const ListComponent = ({ posts, onRead, onModify, onDelete }) => {
  return (
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-200">
          <th className="border px-2 py-1">번호</th>
          <th className="border px-2 py-1">제목</th>
          <th className="border px-2 py-1">작성자</th>
          <th className="border px-2 py-1">작성일</th>
          <th className="border px-2 py-1">관리</th>
        </tr>
      </thead>
      <tbody>
        {posts.length === 0 && (
          <tr>
            <td colSpan="5" className="text-center py-4">
              글이 없습니다.
            </td>
          </tr>
        )}
        {posts.map(({ cno, title, writer, regDate }) => (
          <tr key={cno}>
            <td className="border px-2 py-1 text-center">{cno}</td>
            <td
              className="border px-2 py-1 text-blue-600 cursor-pointer"
              onClick={() => onRead(cno)}
            >
              {title}
            </td>
            <td className="border px-2 py-1 text-center">{writer}</td>
            <td className="border px-2 py-1 text-center">{regDate}</td>
            <td className="border px-2 py-1 text-center">
              <button
                onClick={() => onModify(cno)}
                className="mr-2 bg-yellow-400 px-2 py-1 rounded"
              >
                수정
              </button>
              <button
                onClick={() => onDelete(cno)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                삭제
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ListComponent;
