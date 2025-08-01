import React from "react";
import { motion } from "framer-motion";
import LevelCard from "./LevelCard";
import SharingSlider from "./SharingSlider";
import { useNavigate } from "react-router-dom";

const SharingIntroComponent = () => {
  const navigate = useNavigate();
  const goToSharingAll = () => navigate("/sharing/all");

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
    <div>
      {/* 나눔 레벨 안내 - 맨 위로 이동 */}
      <div className="bg-gray-50 py-12 pt-60">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-green-800 mb-3 animate-fade-in-up">
            🌱 나눔 레벨 안내
          </h2>
          <p className="text-gray-700 text-sm md:text-base animate-fade-in-up delay-300">
            기부 실적에 따라 <strong>포인트가 적립</strong>되고, 누적 포인트에
            따라 <strong>레벨이 상승</strong>합니다. 각 레벨별로 혜택과 리워드가
            제공됩니다.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8 px-4">
          {levels.map((item, i) => (
            <LevelCard key={item.level} {...item} delay={i * 150} />
          ))}
        </div>

        <div className="text-center mt-8 space-x-4">
          <button
            onClick={goToSharingAll}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-full transition-colors duration-300"
          >
            나눔상품 보러가기
          </button>
          <button
            onClick={() => navigate("/order/order-list")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-full transition-colors duration-300"
          >
            나눔상품 기부하기
          </button>
        </div>
      </div>

      {/* 5초마다 넘어가는 쉐어링 슬라이더 */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <SharingSlider />
        </div>
      </div>
    </div>
  );
};

export default SharingIntroComponent;
