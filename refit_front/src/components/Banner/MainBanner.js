import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// REFIT 이미지
import refit1 from "./refit_Images/1.jpg";
import refit2 from "./refit_Images/2.jpg";
import refit3 from "./refit_Images/3.jpg";
import refit4 from "./refit_Images/4.jpg";
import refit5 from "./refit_Images/5.jpg";
import refit6 from "./refit_Images/6.jpg";

// 챗봇 이미지
import chatbot1 from "./refit_Images/a1.jpg";
import chatbot2 from "./refit_Images/a2.jpg";
import chatbot3 from "./refit_Images/a3.jpg";

const refitBackgrounds = [refit1, refit2, refit3, refit4, refit5, refit6];
const chatbotBackgrounds = [chatbot1, chatbot2, chatbot3];

// 배너 슬라이드 정보
const bannerSlides = [
  {
    id: "refit",
    alt: "순환형 옷 나눔",
    link: "/about/refit",
    title: "REFIT - 지속 가능한 옷 나눔",
    description:
      "한 번 입고 버려지는 옷, 임산부와 빠르게 성장하는 영유아의 옷까지, REFIT은 그 옷에 두 번째 생명을 줍니다.",
    buttonText: "자세히 보기",
    backgrounds: refitBackgrounds,
  },
  {
    id: "chatbot",
    alt: "챗봇 옷 구매",
    link: "/features/chatbot",
    title: "챗봇과 함께하는 스마트 쇼핑",
    description:
      "AI 챗봇과 대화하며 나만의 완벽한 스타일을 쉽고 빠르게 완성하세요.",
    buttonText: "챗봇 사용해보기",
    backgrounds: chatbotBackgrounds,
  },
];

const MainBanner = () => {
  const [refitBgIndex, setRefitBgIndex] = useState(0);
  const [chatbotBgIndex, setChatbotBgIndex] = useState(0);

  // REFIT 이미지 자동 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setRefitBgIndex((prev) => (prev + 1) % refitBackgrounds.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 챗봇 이미지 자동 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setChatbotBgIndex((prev) => (prev + 1) % chatbotBackgrounds.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black mt-[184px]">
      <div style={{ width: "100%", maxWidth: "none", margin: 0, padding: 0 }}>
        <Swiper
          modules={[Navigation]}
          slidesPerView={1}
          loop={true}
          navigation
          className="w-full h-[500px]"
        >
          {bannerSlides.map((item) => {
            const currentIndex =
              item.id === "refit" ? refitBgIndex : chatbotBgIndex;
            const currentImage = item.backgrounds[currentIndex];

            return (
              <SwiperSlide key={item.id} className="relative">
                <img
                  src={currentImage}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />
                <div className="absolute inset-0 z-20 flex flex-col justify-top items-start pt-24 pl-12  text-white max-w-[50%]">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                    {item.title}
                  </h2>
                  <p className="mb-4 text-lg md:text-xl drop-shadow-md leading-relaxed">
                    {item.description}
                  </p>

                  {item.id === "chatbot" ? (
                    <a
                      href="/features/chatbot"
                      className="bg-refit-green px-5 py-2 rounded-md font-semibold hover:bg-refit-green-dark transition"
                    >
                      {item.buttonText}
                    </a>
                  ) : (
                    <a
                      href={item.link}
                      className="bg-refit-green px-5 py-2 rounded-md font-semibold hover:bg-refit-green-dark transition"
                    >
                      {item.buttonText}
                    </a>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default MainBanner;
