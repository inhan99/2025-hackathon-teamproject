import React from "react";
import { Link } from "react-router-dom";

const BoardSelectionPage = () => {
  const boards = [
    {
      id: "freedom",
      name: "자유게시판",
      description: "자유롭게 이야기를 나누는 공간",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      icon: "💬",
    },
    {
      id: "secret",
      name: "비밀게시판",
      description: "익명으로 비밀스러운 이야기를 나누는 공간",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      icon: "🔒",
    },
    {
      id: "share",
      name: "나눔게시판",
      description: "물건을 나누고 교환하는 공간",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      icon: "🎁",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-52 max-w-[1440px] mx-auto py-4 bg-[#ffffff] border-l-4 border-r-4">
      <div className="max-w-4xl mx-auto py-16 px-4">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">커뮤니티</h1>
          <p className="text-gray-600 text-lg">
            다양한 이야기를 나누는 공간입니다
          </p>
        </div>

        {/* 게시판 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Link
              key={board.id}
              to={`/boards/${board.id}`}
              className="group block"
            >
              <div
                className={`relative overflow-hidden rounded-2xl ${board.bgColor} p-8 transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02]`}
              >
                {/* 그라데이션 배경 */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${board.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                {/* 아이콘 */}
                <div className="relative z-10 text-center mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${board.bgColor} group-hover:bg-white transition-colors duration-300`}
                  >
                    <span className="text-2xl">{board.icon}</span>
                  </div>
                </div>

                {/* 제목 */}
                <div className="relative z-10 text-center mb-3">
                  <h2
                    className={`text-xl font-bold ${board.textColor} group-hover:text-gray-900 transition-colors duration-300`}
                  >
                    {board.name}
                  </h2>
                </div>

                {/* 설명 */}
                <div className="relative z-10 text-center">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {board.description}
                  </p>
                </div>

                {/* 화살표 아이콘 */}
                <div className="relative z-10 absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 하단 링크 */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BoardSelectionPage;
