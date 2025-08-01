import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaStop, FaTrash } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { ChartComponent, FullScreenChartComponent } from "./ChartComponents";
import { handleChatMessage } from "./Chat";
import { handleGraphMessage, getProductInfo } from "./Graph";
import ScrollToTopButton from "../common/ScrollToTopButton";
import ScrollToBottomButton from "../common/ScrollToBottomButton";
import {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
} from "../../util/chatHistoryUtil";

// CSS 애니메이션 스타일
const floatingIconStyles = `
  @keyframes slideInFromBottom {
    0% {
      opacity: 0;
      transform: translateY(20px) scale(0.8);
    }
    100% {
      opacity: 1;
      transform: translateY(0px) scale(1);
    }
  }
  
  @keyframes slideOutToBottom {
    0% {
      opacity: 1;
      transform: translateY(0px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(20px) scale(0.8);
    }
  }
  
  @keyframes rotateClockwise {
    0% {
      transform: rotate(0deg);
      transform-origin: center center;
    }
    100% {
      transform: rotate(90deg);
      transform-origin: center center;
    }
  }
  
  @keyframes rotateCounterClockwise {
    0% {
      transform: rotate(90deg);
      transform-origin: center center;
    }
    100% {
      transform: rotate(0deg);
      transform-origin: center center;
    }
  }
`;

function FloatingChat({ forceOpen = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authSlice);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => loadChatHistory());
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("chat");
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [selectedChartData, setSelectedChartData] = useState(null);
  const [productCache, setProductCache] = useState({});
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatWindowRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ left: undefined, top: undefined });

  const dragStartRef = useRef({
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [size, setSize] = useState({ width: 384, height: 500 });
  const resizeStartRef = useRef({
    startX: 0,
    startY: 0,
    initialWidth: 0,
    initialHeight: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  // 검색창 관련 상태
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const searchInputRef = useRef(null);

  // 검색창 드래그 관련 상태
  const [searchPosition, setSearchPosition] = useState({
    left: undefined,
    top: undefined,
  });
  const [isSearchDragging, setIsSearchDragging] = useState(false);
  const searchDragStartRef = useRef({
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  // Toast 알림 상태 추가
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Toast 표시 함수
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  // Toast 닫기 함수
  const closeToast = () => {
    setToast({ show: false, message: "", type: "info" });
  };

  // 검색창 드래그 핸들러
  const handleSearchMouseDown = (e) => {
    // 버튼 클릭 시 드래그 방지
    if (
      e.button !== 0 ||
      e.target.tagName === "BUTTON" ||
      e.target.parentElement.tagName === "BUTTON" ||
      e.target.tagName === "INPUT"
    ) {
      return;
    }
    e.preventDefault();
    setIsSearchDragging(true);
    searchDragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft:
        searchPosition.left !== undefined
          ? searchPosition.left
          : window.innerWidth - 320 - 24,
      initialTop:
        searchPosition.top !== undefined
          ? searchPosition.top
          : window.innerHeight - 120 - 80,
    };
  };

  const handleSearchMouseMove = useCallback(
    (e) => {
      if (!isSearchDragging) return;

      const deltaX = e.clientX - searchDragStartRef.current.startX;
      const deltaY = e.clientY - searchDragStartRef.current.startY;

      let newLeft = searchDragStartRef.current.initialLeft + deltaX;
      let newTop = searchDragStartRef.current.initialTop + deltaY;

      const { innerWidth, innerHeight } = window;
      const searchWidth = 320; // 검색창 너비
      const searchHeight = 120; // 검색창 높이 (대략적)

      // Boundary checks
      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft + searchWidth > innerWidth)
        newLeft = innerWidth - searchWidth;
      if (newTop + searchHeight > innerHeight)
        newTop = innerHeight - searchHeight;

      setSearchPosition({ left: newLeft, top: newTop });
    },
    [isSearchDragging]
  );

  const handleSearchMouseUp = useCallback(() => {
    setIsSearchDragging(false);
  }, []);

  useEffect(() => {
    if (isOpen && position.left === undefined) {
      setPosition({
        left: window.innerWidth - size.width - 24,
        top: window.innerHeight - size.height - 112,
      });
    }
  }, [isOpen, position.left, size.width, size.height]);

  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  // 메시지가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // 로그인 상태 변경 감지
  useEffect(() => {
    // 로그인 상태가 변경되면 채팅기록을 다시 불러옴
    const currentHistory = loadChatHistory();
    setMessages(currentHistory);
  }, [authState.member?.email]); // 로그인 상태가 변경될 때만 실행

  const handleMouseDown = (e) => {
    // 버튼 클릭 시 드래그 방지
    if (
      e.button !== 0 ||
      e.target.tagName === "BUTTON" ||
      e.target.parentElement.tagName === "BUTTON"
    ) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: position.left,
      initialTop: position.top,
    };
  };

  const handleResizeMouseDown = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: size.width,
      initialHeight: size.height,
      initialLeft: position.left,
      initialTop: position.top,
    };
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !chatWindowRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      let newLeft = dragStartRef.current.initialLeft + deltaX;
      let newTop = dragStartRef.current.initialTop + deltaY;

      const { innerWidth, innerHeight } = window;
      const { width, height } = size;

      // Boundary checks
      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft + width > innerWidth) newLeft = innerWidth - width;
      if (newTop + height > innerHeight) newTop = innerHeight - height;

      setPosition({ left: newLeft, top: newTop });
    },
    [isDragging, size.width, size.height]
  );

  const handleResizeMouseMove = useCallback(
    (e) => {
      if (!isResizing) return;

      const {
        startX,
        startY,
        initialWidth,
        initialHeight,
        initialLeft,
        initialTop,
      } = resizeStartRef.current;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newLeft = initialLeft;
      let newTop = initialTop;

      const minWidth = 320;
      const minHeight = 400;
      const { innerWidth, innerHeight } = window;

      if (resizeDirection.includes("e")) {
        newWidth = initialWidth + deltaX;
      }
      if (resizeDirection.includes("w")) {
        newWidth = initialWidth - deltaX;
        newLeft = initialLeft + deltaX;
      }
      if (resizeDirection.includes("s")) {
        newHeight = initialHeight + deltaY;
      }
      if (resizeDirection.includes("n")) {
        newHeight = initialHeight - deltaY;
        newTop = initialTop + deltaY;
      }

      // Boundary checks
      if (newLeft < 0) {
        newWidth += newLeft;
        newLeft = 0;
      }
      if (newTop < 0) {
        newHeight += newTop;
        newTop = 0;
      }
      if (newLeft + newWidth > innerWidth) {
        newWidth = innerWidth - newLeft;
      }
      if (newTop + newHeight > innerHeight) {
        newHeight = innerHeight - newTop;
      }

      if (newWidth < minWidth) {
        if (resizeDirection.includes("w")) {
          newLeft += newWidth - minWidth;
        }
        newWidth = minWidth;
      }

      if (newHeight < minHeight) {
        if (resizeDirection.includes("n")) {
          newTop += newHeight - minHeight;
        }
        newHeight = minHeight;
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ left: newLeft, top: newTop });
    },
    [isResizing, resizeDirection]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection("");
  }, []);

  useEffect(() => {
    const isInteracting = isDragging || isResizing || isSearchDragging;

    const handleInteractionMove = (e) => {
      if (isDragging) handleMouseMove(e);
      if (isResizing) handleResizeMouseMove(e);
      if (isSearchDragging) handleSearchMouseMove(e);
    };

    const handleInteractionUp = () => {
      if (isDragging) setIsDragging(false);
      if (isResizing) {
        setIsResizing(false);
        setResizeDirection("");
      }
      if (isSearchDragging) setIsSearchDragging(false);
    };

    if (isInteracting) {
      document.body.style.userSelect = "none";
      if (isDragging) {
        document.body.style.cursor = "grabbing";
      } else if (isResizing) {
        document.body.style.cursor = `${resizeDirection}-resize`;
      } else if (isSearchDragging) {
        document.body.style.cursor = "grabbing";
      }

      document.addEventListener("mousemove", handleInteractionMove);
      document.addEventListener("mouseup", handleInteractionUp);
    } else {
      document.body.style.userSelect = "auto";
      document.body.style.cursor = "default";
    }

    return () => {
      document.removeEventListener("mousemove", handleInteractionMove);
      document.removeEventListener("mouseup", handleInteractionUp);
    };
  }, [
    isDragging,
    isResizing,
    isSearchDragging,
    resizeDirection,
    handleMouseMove,
    handleResizeMouseMove,
    handleSearchMouseMove,
  ]);

  const handleSendWithText = useCallback(
    async (text, currentMode = mode) => {
      if (!text.trim()) return;

      const userMessage = {
        type: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        if (currentMode === "chat") {
          const { botMessage, shouldIgnoreNavigation } =
            await handleChatMessage(text, authState, dispatch, navigate);
          setMessages((prev) => [...prev, botMessage]);

          // Toast 알림 처리
          const botContent = botMessage.content;
          if (
            botContent.includes("로그인이 필요한 서비스입니다") ||
            botContent.includes("먼저 로그인해주세요")
          ) {
            showToast(
              "로그인이 필요한 서비스입니다. 먼저 로그인해주세요.",
              "warning"
            );
          } else if (
            botContent.includes("신체정보") &&
            botContent.includes("입력해주세요")
          ) {
            showToast("신체정보를 입력해주세요.", "info");
          }

          // navigation_info의 login_required 상태 확인
          if (botMessage.navigation && botMessage.navigation.login_required) {
            showToast(
              "로그인이 필요한 서비스입니다. 먼저 로그인해주세요.",
              "warning"
            );
          }

          if (
            botMessage.navigation &&
            botMessage.navigation.show_button &&
            !botMessage.navigation.login_required &&
            !shouldIgnoreNavigation
          ) {
            navigate(botMessage.navigation.button_url);
          }
        } else if (currentMode === "graph") {
          const { botMessage } = await handleGraphMessage(
            text,
            setProductCache,
            productCache
          );
          setMessages((prev) => [...prev, botMessage]);
        }
      } catch (error) {
        const errorMessage = {
          type: "bot",
          content: "❌ 오류가 발생했습니다.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [mode, authState, dispatch, navigate, productCache]
  );

  // Web Speech API 초기화
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "ko-KR";
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += transcript;
          else interimTranscript += transcript;
        }
        if (finalTranscript) {
          setInput(finalTranscript);
          setInterimText("");
          setIsListening(false);
          setTimeout(() => handleSendWithText(finalTranscript), 500);
        } else {
          setInterimText(interimTranscript);
        }
      };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event) => {
        console.error("음성 인식 오류:", event.error);
        setIsListening(false);
        // 오류 메시지 표시는 생략
      };
    }
    return () => recognitionRef.current?.stop();
  }, [handleSendWithText]);

  const startListening = () => recognitionRef.current?.start();
  const stopListening = () => recognitionRef.current?.stop();

  const handleSend = () => handleSendWithText(input);

  // 채팅기록 삭제 함수
  const handleClearHistory = () => {
    if (window.confirm("채팅 기록을 모두 삭제하시겠습니까?")) {
      setMessages([]);
      clearChatHistory();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) =>
    timestamp.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatMessage = (content) =>
    content.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const openChartModal = (chartData) => {
    setSelectedChartData(chartData);
    setIsChartModalOpen(true);
  };

  const closeChartModal = () => {
    setIsChartModalOpen(false);
    setSelectedChartData(null);
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isChartModalOpen) {
        closeChartModal();
      }
    };

    if (isChartModalOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isChartModalOpen]);

  const handleChartClick = (chartData, dataPointIndex = 0) => {
    const productId = chartData.productIds?.[dataPointIndex];
    if (productId) {
      navigate(`/product/${productId}`);
      closeChartModal();
    }
  };

  const handleGetProductInfo = (productId) =>
    getProductInfo(productId, setProductCache, productCache);

  // 검색 기능 핸들러
  // 검색 버튼 클릭 핸들러
  const handleSearchClick = () => {
    if (isSearchOpen) {
      // 검색창이 열려있으면 닫기
      setIsSearchOpen(false);
      setSearchKeyword("");
      setSearchPosition({ left: undefined, top: undefined }); // 위치 초기화
    } else {
      // 검색창이 닫혀있으면 열기
      setIsSearchOpen(true);
      // 다음 프레임에서 input에 포커스
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  // 검색 실행 핸들러
  const handleSearchSubmit = () => {
    if (searchKeyword.trim()) {
      navigate("/search", {
        state: {
          keyword: searchKeyword.trim(),
          searchType: "products",
        },
      });
      setIsSearchOpen(false);
      setSearchKeyword("");
    }
  };

  // 검색창 닫기 핸들러
  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchKeyword("");
  };

  // 검색창 엔터키 핸들러
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    } else if (e.key === "Escape") {
      handleSearchClose();
    }
  };

  // 검색창 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen && !event.target.closest(".search-container")) {
        setIsSearchOpen(false);
        setSearchKeyword("");
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  // CSS 애니메이션 스타일 주입
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = floatingIconStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <>
      {/* 챗봇 닫기 버튼 */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-500 ease-out bg-red-500 hover:bg-red-600 hover:scale-110"
          style={{ zIndex: 60 }}
          onClick={() => {
            setIsOpen(false);
            setIsSearchOpen(false);
            setSearchKeyword("");
          }}
        >
          <span
            className="text-white font-bold text-3xl"
            style={{ display: "inline-block", transform: "translateY(-4px)" }}
          >
            ×
          </span>
        </div>
      )}

      {/* 검색창 닫기 버튼 */}
      {isSearchOpen && !isOpen && (
        <div
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-500 ease-out bg-red-500 hover:bg-red-600 hover:scale-110"
          style={{ zIndex: 70 }}
          onClick={() => {
            setIsSearchOpen(false);
            setSearchKeyword("");
            setSearchPosition({ left: undefined, top: undefined });
          }}
        >
          <span
            className="text-white font-bold text-3xl"
            style={{ display: "inline-block", transform: "translateY(-4px)" }}
          >
            ×
          </span>
        </div>
      )}

      {/* 검색창 */}
      {isSearchOpen && !isOpen && (
        <div
          className="search-container fixed w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 cursor-grab"
          style={{
            zIndex: 60,
            left:
              searchPosition.left !== undefined
                ? `${searchPosition.left}px`
                : "auto",
            top:
              searchPosition.top !== undefined
                ? `${searchPosition.top}px`
                : "auto",
            right: searchPosition.left === undefined ? "24px" : "auto",
            bottom: searchPosition.top === undefined ? "80px" : "auto",
            transform: isSearchDragging ? "scale(1.02)" : "scale(1)",
            transition: isSearchDragging ? "none" : "all 0.3s ease-out",
            boxShadow: isSearchDragging
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
          onMouseDown={handleSearchMouseDown}
        >
          <div className="flex items-center justify-between mb-3 cursor-grab">
            <h3 className="text-lg font-semibold text-gray-800">상품 검색</h3>
            <button
              className="bg-transparent border-none text-gray-500 hover:text-gray-700 text-xl cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-100 leading-none"
              style={{
                lineHeight: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 70,
              }}
              onClick={() => {
                setIsSearchOpen(false);
                setSearchKeyword("");
                setSearchPosition({ left: undefined, top: undefined });
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: "translateY(-2px)",
                }}
              >
                ×
              </span>
            </button>
          </div>

          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* 돋보기 아이콘 */}
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />

            {/* 검색 버튼 */}
            <button
              onClick={handleSearchSubmit}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              검색
            </button>
          </div>
        </div>
      )}

      {/* 채팅 모달 */}
      {isOpen && position.left !== undefined && (
        <div
          ref={chatWindowRef}
          className="fixed bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          style={{
            left: `${position.left}px`,
            top: `${position.top}px`,
            width: `${size.width}px`,
            height: `${size.height}px`,
            zIndex: 60,
          }}
        >
          {/* 헤더 */}
          <div
            className="bg-[#B977F9] text-white px-5 py-4 rounded-t-2xl flex justify-between items-center cursor-grab flex-shrink-0"
            onMouseDown={handleMouseDown}
          >
            <div className="flex flex-col gap-1 ">
              <h3 className="text-lg font-semibold m-0">REFIT 채팅봇</h3>
              <div className="text-xs opacity-80 font-normal">
                {mode === "chat" ? "일반 대화" : "그래프 생성"}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className={`w-16 h-7 rounded-full text-xs cursor-pointer transition-all duration-200 border-none flex items-center justify-center ${
                  mode === "chat"
                    ? "bg-green-600 font-semibold"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => setMode("chat")}
              >
                채팅
              </button>
              <button
                className={`w-16 h-7 rounded-full text-xs cursor-pointer transition-all duration-200 border-none flex items-center justify-center ${
                  mode === "graph"
                    ? "bg-green-600 font-semibold"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => setMode("graph")}
              >
                그래프
              </button>
              {messages.length > 0 && (
                <button
                  className="w-7 h-7 rounded-full text-xs cursor-pointer transition-all duration-200 border-none flex items-center justify-center bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleClearHistory}
                  title="채팅 기록 삭제"
                >
                  <FaTrash size={10} />
                </button>
              )}
            </div>

            <button
              className="bg-transparent border-none text-white text-xl cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-700 leading-none"
              style={{
                lineHeight: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setIsOpen(false)}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: "translateY(-2px)",
                }}
              >
                ×
              </span>
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-100 scroll-smooth flex flex-col justify-start items-stretch">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-5 px-5 bg-white rounded-xl mb-3 self-center max-w-[90%] border border-gray-200">
                안녕하세요! REFIT 채팅봇입니다. 무엇을 도와드릴까요? 😊
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex flex-col w-full ${
                  message.type === "user"
                    ? "items-end self-end"
                    : "items-start self-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${
                    message.type === "user"
                      ? "bg-[#475569] text-white rounded-br-md"
                      : "bg-white text-gray-800 border-2 border-gray-200 rounded-bl-md"
                  }`}
                >
                  {formatMessage(message.content)}
                  {message.chartData && (
                    <div className="mt-3 text-center">
                      <div
                        className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                        onClick={() => openChartModal(message.chartData)}
                        title="클릭하여 전체화면으로 보기"
                      >
                        <ChartComponent
                          chartData={message.chartData}
                          onChartClick={handleChartClick}
                          getProductInfo={handleGetProductInfo}
                          productCache={productCache}
                        />
                        <div className="text-xs text-blue-600 mt-2 font-medium">
                          📊 클릭하여 전체화면으로 보기
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 px-1">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mb-4 flex flex-col w-full items-start self-start">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap bg-white text-gray-800 border-2 border-gray-200 rounded-bl-md">
                  <div className="flex items-center gap-1 py-1 justify-start">
                    <span
                      className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"
                      style={{ animationDelay: "-0.32s" }}
                    ></span>
                    <span
                      className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"
                      style={{ animationDelay: "-0.16s" }}
                    ></span>
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="p-4 bg-white border-t border-gray-200 flex gap-3 items-end flex-shrink-0">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 border-none ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : isListening
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : "bg-[#B977F9] hover:bg-[#A568E0] text-white"
              }`}
              title={isListening ? "음성 인식 중지" : "음성 인식 시작"}
            >
              {isListening ? <FaStop size={16} /> : <FaMicrophone size={16} />}
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isListening
                  ? "듣는 중..."
                  : mode === "chat"
                  ? "메시지 입력"
                  : "그래프 질문 입력"
              }
              rows="1"
              disabled={isLoading || isListening}
              className={`flex-1 border border-gray-300 rounded-full px-4 py-3 text-sm resize-none outline-none transition-colors duration-200 font-inherit min-h-10 leading-tight ${
                isLoading || isListening
                  ? "bg-gray-100 text-gray-500"
                  : "focus:border-[#B977F9] focus:ring-2 focus:ring-[#B977F9]/30"
              }`}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || isListening}
              className={`px-5 py-3 rounded-full text-sm cursor-pointer transition-all duration-200 whitespace-nowrap border-none ${
                isLoading || !input.trim() || isListening
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#B977F9] text-white hover:bg-[#A568E0] hover:shadow-lg"
              }`}
            >
              전송
            </button>
          </div>
          {/* Resize Handles */}
          <div
            className="absolute -top-1 -left-1 w-3 h-3 cursor-nwse-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 cursor-nesw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 cursor-nesw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 cursor-nwse-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "se")}
          />
          <div
            className="absolute top-0 left-1 right-1 h-2 cursor-ns-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "n")}
          />
          <div
            className="absolute bottom-0 left-1 right-1 h-2 cursor-ns-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "s")}
          />
          <div
            className="absolute top-1 bottom-1 left-0 w-2 cursor-ew-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "w")}
          />
          <div
            className="absolute top-1 bottom-1 right-0 w-2 cursor-ew-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
          />
        </div>
      )}

      {/* 차트 전체화면 모달 */}
      {isChartModalOpen && selectedChartData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4"
          onClick={(e) => {
            // 모달 외부 클릭 시 닫기
            if (e.target === e.currentTarget) {
              closeChartModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 rounded-t-2xl flex justify-between items-center border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-800">
                  📊 {selectedChartData.title || "데이터 분석 결과"}
                </h3>
                <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
                  {selectedChartData.chartType || "bar"} 차트
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={closeChartModal}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center gap-1"
                  title="채팅창으로 돌아가기"
                >
                  ← 채팅으로
                </button>
                <button
                  onClick={closeChartModal}
                  className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                  title="닫기"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className="w-full h-full cursor-pointer"
                  title={
                    selectedChartData.productIds?.length > 0
                      ? "차트의 데이터 포인트를 클릭하여 상품 상세페이지로 이동"
                      : ""
                  }
                >
                  <FullScreenChartComponent
                    chartData={selectedChartData}
                    onChartClick={handleChartClick}
                    getProductInfo={handleGetProductInfo}
                    productCache={productCache}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">X축:</span>{" "}
                  {selectedChartData.xAxisTitle || "카테고리"} |
                  <span className="font-medium ml-2">Y축:</span>{" "}
                  {selectedChartData.yAxisTitle || "값"}
                </div>
                <div className="text-sm text-gray-600">
                  데이터 개수: {selectedChartData.categories?.length || 0}개
                </div>
              </div>
              {selectedChartData.productIds?.length > 0 && (
                <div className="mt-2 text-center">
                  <div className="text-sm text-blue-600 font-medium">
                    📊 그래프를 클릭하면 상품 상세페이지로 이동합니다
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast 알림 */}
      {toast.show && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[200] px-6 py-4 rounded-lg shadow-lg text-white font-medium ${
            toast.type === "warning"
              ? "bg-orange-500"
              : toast.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>
              {toast.type === "warning"
                ? "⚠️"
                : toast.type === "error"
                ? "❌"
                : "ℹ️"}
            </span>
            <span>{toast.message}</span>
            <button
              onClick={closeToast}
              className="text-white text-sm font-bold ml-4 px-3 py-1 rounded border border-white hover:bg-white hover:text-gray-800 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 우측 하단 버튼들 */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* 챗봇 버튼 */}
        <div
          className="w-11 h-11 bg-[#B977F9] hover:bg-[#A568E0] rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 ease-in-out hover:scale-110"
          onClick={() => setIsOpen(true)}
        >
          <span className="text-white text-lg">🤵</span>
        </div>

        {/* 검색 버튼 */}
        <div
          className="w-11 h-11 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 ease-in-out hover:scale-110"
          onClick={handleSearchClick}
        >
          <FiSearch size={18} className="text-white" />
        </div>

        {/* 스크롤 버튼들 - 하단 스크롤 버튼이 위에, 상단 스크롤 버튼이 아래에 */}
        <ScrollToBottomButton />
        <ScrollToTopButton />
      </div>
    </>
  );
}

export default FloatingChat;
