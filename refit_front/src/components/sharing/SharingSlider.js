import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SharingSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      images: [
        "/sharing/a1.jpg",
        "/sharing/a2.jpg",
        "/sharing/a3.jpg",
        "/sharing/a4.jpg",
      ],
      title: "기부, 순환, 보상 그리고 공감",
      subtitle: "의미 있는 나눔이 당신을 기다립니다.",
      descriptions: [
        "이 이미지는 기부, 순환, 보상 그리고 공감을 상징합니다.",
        "기부의 다양한 순간을 담은 사진입니다.",
        "우리 사회의 의미 있는 나눔 장면입니다.",
        "당신과 함께하는 따뜻한 나눔의 모습입니다.",
      ],
      reverse: false,
    },
    {
      id: 2,
      images: [
        "/sharing/b1.jpg",
        "/sharing/b2.jpg",
        "/sharing/b3.jpg",
        "/sharing/b4.jpg",
      ],
      title: "디지털 기반 사회혁신",
      subtitle: "기술과 데이터로 만드는 나눔의 미래.",
      descriptions: [
        "디지털 사회혁신의 첫걸음입니다.",
        "기술이 만드는 새로운 나눔의 미래.",
        "데이터 기반 기부 플랫폼 모습.",
        "혁신적인 사회적 연결의 순간.",
      ],
      reverse: true,
    },
    {
      id: 3,
      images: ["/sharing/c1.jpg", "/sharing/c2.jpg", "/sharing/c3.jpg"],
      title: "기부 마켓, 참여의 기회",
      subtitle: "모든 이가 기부자로, 모두가 수혜자로.",
      descriptions: [
        "기부 마켓에서 다양한 참여 기회가 열립니다.",
        "누구나 쉽게 참여하는 기부의 장.",
        "모두가 함께 만드는 따뜻한 기부 문화.",
      ],
      reverse: false,
    },
    {
      id: 4,
      images: [
        "/sharing/d1.jpg",
        "/sharing/d2.jpg",
        "/sharing/d3.jpg",
        "/sharing/d4.jpg",
        "/sharing/d5.jpg",
        "/sharing/d6.jpg",
      ],
      title: "사회적 약자를 위한 연결",
      subtitle: "가장 필요한 곳에 닿는 따뜻한 손길.",
      descriptions: [
        "사회적 약자를 위한 따뜻한 연결의 순간들.",
        "필요한 곳에 손길이 닿는 장면.",
        "희망을 전하는 나눔의 모습.",
        "함께하는 사회적 연대의 상징.",
        "다양한 도움의 손길과 이야기.",
        "서로가 서로를 돕는 소중한 순간.",
      ],
      reverse: true,
    },
    {
      id: 5,
      images: [
        "/sharing/e1.jpg",
        "/sharing/e2.jpg",
        "/sharing/e3.jpg",
        "/sharing/e4.jpg",
      ],
      title: "작은 나눔, 큰 울림",
      subtitle: "당신의 참여로 세상이 더 밝아집니다.",
      descriptions: [
        "작은 나눔이 모여 큰 울림이 됩니다.",
        "당신의 참여가 세상을 밝힙니다.",
        "모두가 함께 만드는 따뜻한 변화.",
        "기부로 전하는 사랑과 희망의 메시지.",
      ],
      reverse: false,
    },
  ];

  const [imageIndex, setImageIndex] = useState(0);

  // 10초마다 슬라이드 자동 전환
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setImageIndex(0); // 새 슬라이드에서 첫 번째 이미지부터 시작
    }, 10000);

    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // 3초마다 슬라이드 내 이미지 전환
  useEffect(() => {
    const currentSlideData = slides[currentSlide];
    const imageInterval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % currentSlideData.images.length);
    }, 3000);

    return () => clearInterval(imageInterval);
  }, [currentSlide, slides]);

  const currentSlideData = slides[currentSlide];

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.section
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`w-full min-h-[40vh] flex flex-col md:flex-row items-center justify-center py-8 gap-4 md:gap-8 ${
            currentSlideData.reverse ? "md:flex-row-reverse" : ""
          }`}
        >
          {/* 이미지 영역 */}
          <div className="flex-[7] w-full rounded-lg overflow-hidden shadow-md max-h-[400px]">
            <motion.img
              key={imageIndex}
              src={currentSlideData.images[imageIndex]}
              alt="슬라이드 이미지"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-full h-full object-cover object-center brightness-75"
              style={{ aspectRatio: "5 / 3" }}
            />
          </div>

          {/* 텍스트 영역 */}
          <motion.div
            className="flex-[3] text-gray-900 text-center md:text-left max-w-lg px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide mb-4">
              {currentSlideData.title}
            </h2>
            <p className="text-sm md:text-base text-gray-700 mb-4">
              {currentSlideData.subtitle}
            </p>
            <motion.p
              key={imageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-lg md:text-xl text-gray-700"
            >
              {currentSlideData.descriptions[imageIndex]}
            </motion.p>
          </motion.div>
        </motion.section>
      </AnimatePresence>

      {/* 슬라이드 인디케이터 */}
      <div className="flex justify-center space-x-2 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              setImageIndex(0);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-green-600 scale-125"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* 진행 바 */}
      <div className="w-full bg-gray-200 rounded-full h-1 mt-4 overflow-hidden">
        <motion.div
          className="bg-green-600 h-1 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity }}
          key={currentSlide}
        />
      </div>
    </div>
  );
};

export default SharingSlider;
