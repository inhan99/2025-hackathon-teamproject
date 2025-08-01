import React, { useState, useEffect } from "react";
import { FiChevronUp } from "react-icons/fi";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 위치를 감지해서 버튼 표시/숨김
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 0) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // 맨 위로 스크롤하는 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <div
          className="w-11 h-11 bg-gray-800 hover:bg-gray-900 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 ease-in-out hover:scale-110"
          onClick={scrollToTop}
          style={{ position: "relative" }}
        >
          <FiChevronUp size={18} className="text-white" />
        </div>
      )}
    </>
  );
};

export default ScrollToTopButton;
