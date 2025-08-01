import React from "react";
import { Link } from "react-router-dom";

const leftMenuItems = [
  { to: "sharing", label: "나눔" },
  { to: "/recommend", label: "추천" },
  { to: "/ranking", label: "랭킹" },
  { to: "/sale", label: "세일" },
  { to: "/brand", label: "브랜드" },
  { to: "/community", label: "커뮤니티" },
];

const Footer = () => {
  return (
    <footer className="text-black">
      {/* ✅ 상단 메뉴 바 - 왼쪽 정렬 */}
      {/* ✅ 메인 푸터 콘텐츠 */}
      <div className="max-w-[1440px] bg-green-400 mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 py-6">
        {/* 서비스 소개 */}
        <div>
          <h3 className="text-lg font-bold text-black mb-2">Refit 소개</h3>
          <p className="text-sm text-black leading-relaxed">
            배고플땐 탄수화물
          </p>
        </div>

        {/* 바로가기 */}
        <div>
          <h3 className="text-lg font-bold text-black mb-2">바로가기</h3>
          <ul className="text-sm text-black space-y-1">
            <li>
              <Link to="/about" className="hover:underline hover:text-black">
                서비스 소개
              </Link>
            </li>
            <li>
              <Link to="/donation" className="hover:underline hover:text-black">
                기부하기
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:underline hover:text-black">
                상품 보기
              </Link>
            </li>
            <li>
              <Link to="/mypage" className="hover:underline hover:text-black">
                마이페이지
              </Link>
            </li>
          </ul>
        </div>

        {/* 연락처 */}
        <div className="text-black">
          <h3 className="text-lg font-bold text-black mb-2">문의하기</h3>
          <p className="text-sm">Email: refit.team@email.com</p>
          <p className="text-sm">전화: 010-1234-5678</p>
          <p className="text-sm mt-2">
            © 2025 Refit Team. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
