import React, { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

const ScrollToBottomButton = () => {
  const [isVisible, setIsVisible] = useState(true);

  // 스크롤 위치를 감지해서 버튼 표시/숨김
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset === 0) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // 맨 아래로 스크롤하는 함수
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <div
          className="w-11 h-11 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 ease-in-out hover:scale-110"
          onClick={scrollToBottom}
          style={{ position: "relative" }}
        >
          <FiChevronDown size={18} className="text-white" />
        </div>
      )}
    </>
  );
};

export default ScrollToBottomButton;
