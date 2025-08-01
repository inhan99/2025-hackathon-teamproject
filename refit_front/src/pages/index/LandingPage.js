import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LevelCard from "../../components/sharing/LevelCard";

const LandingPage = () => {
  const navigate = useNavigate();
  const wheelTimeoutRef = useRef(null);
  const [showHint, setShowHint] = useState(true);

  // 3초 후 힌트 숨기기
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();

      // 연속 스크롤 방지
      if (wheelTimeoutRef.current) return;

      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 1000);

      const delta = e.deltaY;

      if (delta < 0) {
        // 위로 스크롤 - 메인으로 이동
        navigate("/main");
      } else if (delta > 0) {
        // 아래로 스크롤 - 쉐어링으로 이동
        navigate("/sharing");
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, [navigate]);

  const goToSharingAll = () => navigate("/sharing/전체");
  const goToMainProducts = () => navigate("/main");

  const levels = [
    {
      level: 1,
      label: "새싹",
      img: "/sharing/1.jpg",
      desc: "첫 기부를 축하합니다!",
    },
    {
      level: 2,
      label: "잎사귀",
      img: "/sharing/2.png",
      desc: "꾸준한 나눔의 시작!",
    },
    {
      level: 3,
      label: "나무",
      img: "/sharing/3.png",
      desc: "나눔으로 성장 중!",
    },
    { level: 4, label: "열매", img: "/sharing/4.png", desc: "최고 레벨 달성!" },
  ];

  return (
    <div className="h-screen overflow-hidden relative">
      {/* 메인 섹션 (위쪽 절반) */}
      <div className="h-1/2 bg-[#bebdbe] relative overflow-hidden">
        <div className="absolute inset-0 transform scale-75 -translate-y-4 origin-center">
          <div className="h-full overflow-hidden">
            {/* 상단 콘텐츠 영역 - 메인 이미지 */}
            <div className="h-full flex items-end justify-center relative pb-8">
              {/* 배경 이미지 */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-30"></div>

              {/* 메인 브랜드 이미지 */}
              <div className="relative z-10 text-center">
                {/* 1. 버튼 */}
                <div className="text-center mb-4">
                  <button
                    onClick={goToMainProducts}
                    className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 px-6 rounded-full transition-colors duration-300"
                  >
                    메인상품 보러가기
                  </button>
                </div>

                {/* 2. 이미지 */}
                <img
                  src="/banners/banner1.png"
                  alt="REFIT 메인 배너"
                  className="max-w-lg w-full h-auto mx-auto rounded-lg shadow-2xl"
                />

                {/* 3. 텍스트 */}
                <div className="mt-6">
                  <h2 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
                    친환경 패션의 새로운 시작
                  </h2>
                  <p className="text-white/90 text-sm drop-shadow-md">
                    지속가능한 패션과 나눔의 플랫폼
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 메인 섹션 하단 문구들 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="text-center">
            <div className="text-white text-sm mb-2">휠 올리기 ↑</div>
            <h1 className="text-3xl font-bold text-white bg-black/50 px-6 py-2 rounded-full">
              REFIT MAIN
            </h1>
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="h-1 bg-gradient-to-r from-gray-800 via-white to-green-600 relative z-30">
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2">
          <div className="w-4 h-4 bg-gradient-to-r from-gray-800 to-green-600 rounded-full"></div>
        </div>
      </div>

      {/* 쉐어링 섹션 (아래쪽 절반) - 미러 효과 */}
      <div className="h-1/2 bg-white relative overflow-hidden transform rotate-180">
        <div className="absolute inset-0 transform scale-75 -translate-y-4 origin-center rotate-180">
          <div className="h-full overflow-hidden">
            {/* 나눔 레벨 안내만 */}
            <div className="bg-gray-50 py-8 pt-16">
              <div className="max-w-5xl mx-auto text-center px-4">
                <h2 className="text-2xl font-bold text-green-800 mb-3 animate-fade-in-up">
                  🌱 나눔 레벨 안내
                </h2>
                <p className="text-gray-700 text-sm md:text-base animate-fade-in-up delay-300">
                  기부 실적에 따라 <strong>포인트가 적립</strong>되고, 누적
                  포인트에 따라 <strong>레벨이 상승</strong>합니다. 각 레벨별로
                  혜택과 리워드가 제공됩니다.
                </p>
              </div>

              <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8 px-4">
                {levels.map((item, i) => (
                  <LevelCard key={item.level} {...item} delay={i * 150} />
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={goToSharingAll}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-full transition-colors duration-300"
                >
                  나눔상품 보러가기
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* 쉐어링 라벨과 안내 (미러 효과로 뒤집힘) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 rotate-180">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-600 bg-white/90 px-6 py-2 rounded-full border-2 border-green-600 mb-3">
              REFIT SHARING
            </h1>
            <div className="text-green-600 text-sm">휠 내리기 ↓</div>
          </div>
        </div>
      </div>

      {/* 중앙 네비게이션 힌트 - 3초 후 사라짐 */}
      {showHint && (
        <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 text-center animate-fade-in">
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border animate-pulse">
            <p className="text-gray-800 text-sm font-medium">
              🖱️ 마우스 휠로 탐색하세요
            </p>
            <div className="flex items-center justify-center space-x-4 mt-2">
              <span className="text-xs text-gray-600">↑ 메인</span>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-600">쉐어링 ↓</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
