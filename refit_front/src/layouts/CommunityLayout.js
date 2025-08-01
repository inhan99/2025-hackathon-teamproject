import React from "react";
import { Outlet } from "react-router-dom";

const CommunityLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* 커뮤니티 공통 헤더 */}
      <header className="bg-white shadow-md px-6 py-4">
        <h1 className="text-xl font-bold">📣 커뮤니티</h1>
      </header>

      {/* 페이지 본문 */}
      <main className="px-6 py-8 max-w-4xl mx-auto">
        <Outlet />
      </main>

      {/* 푸터가 필요하다면 여기에 추가 */}
    </div>
  );
};

export default CommunityLayout;
