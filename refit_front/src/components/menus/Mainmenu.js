import React, { useState, useCallback, useEffect, memo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiSearch, FiMic } from "react-icons/fi";
import { GiRecycle } from "react-icons/gi";
import { FaTshirt, FaMicrophone, FaStop } from "react-icons/fa";
import { logoutAsync } from "../../slices/authSlice";
import { useCategory } from "../../hooks/UseCategory";
import { fetchCartItems } from "../../slices/cartSlice";
import VoiceRecorder from "../common/VoiceRecorder";
import { speechSearch } from "../../api/speechApi";
import { searchProducts } from "../../api/searchApi";

// 드롭다운 애니메이션 스타일
const dropdownStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

/* -------------------------------------------------------------------------- */
/*                                   Logo                                     */
/* -------------------------------------------------------------------------- */

/**
 * 리사이클 + 티셔츠 아이콘 로고
 * - 회전 애니메이션은 global.css 에 정의된 .animate-spin-slow 클래스를 사용한다.
 * - memo 로 감싸 불필요한 리렌더 방지.
 */
const Logo = memo(() => (
  <Link
    to="/main"
    className="inline-flex items-center gap-2 cursor-pointer select-none"
    aria-label="REFIT 홈페이지로 이동"
  >
    <div className="relative w-8 h-8 shrink-0">
      <GiRecycle size={32} className="text-green-600 animate-spin-slow" />
      <FaTshirt
        size={14}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
    <span className="text-3xl font-[Bebas Neue] font-bold leading-none text-white">
      REFIT
    </span>{" "}
  </Link>
));

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const LEFT_MENU_ITEMS = [
  { to: "/category", label: "☰", hasDropdown: true },
  { to: "/sharing", label: "나눔" },
  { to: "/main/new", label: "NEW" },
  { to: "/main/recommend", label: "추천" },
  { to: "/main/ranking", label: "랭킹" },
  { to: "/main/sale", label: "세일" },
  { to: "/main/brand", label: "브랜드" },
  { to: "/boards", label: "커뮤니티" },
];

/* -------------------------------------------------------------------------- */
/*                              CategoryDropdown                              */
/* -------------------------------------------------------------------------- */

const CategoryDropdown = ({
  showDropdown,
  hoveredCategory,
  categories,
  onCategoryHover,
  onMouseLeave,
  onCategoryClick,
}) => {
  if (!showDropdown) return null;

  return (
    <div
      className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-4 px-6 min-w-[400px] z-50"
      onMouseLeave={onMouseLeave}
    >
      <div className="flex gap-8">
        {/* 상의, 하의, 신발 카테고리를 세로로 배치 */}
        <div className="flex flex-col gap-2">
          {Object.keys(categories).map((category) => (
            <h3
              key={category}
              className={`text-lg cursor-pointer transition-colors px-3 py-2 rounded ${
                hoveredCategory === category
                  ? "text-black font-bold bg-blue-50 border-l-4 border-blue-500"
                  : "text-gray-800 hover:text-black hover:bg-gray-50 font-medium"
              }`}
              onMouseEnter={() => onCategoryHover(category)}
              onClick={() => onCategoryClick(category, null)} // 메인 카테고리 클릭 시
            >
              {category}
            </h3>
          ))}
        </div>

        {/* 선택된 카테고리의 세부 항목들을 세로로 배치 */}
        {hoveredCategory && (
          <div className="flex flex-col animate-fadeIn border-l-2 border-gray-200 pl-4">
            {categories[hoveredCategory].map((item, index) => (
              <div
                key={item}
                className="text-base text-gray-700 hover:text-black cursor-pointer transition-all duration-200 hover:translate-x-1 py-2 border-b border-gray-100 last:border-b-0"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => onCategoryClick(hoveredCategory, item)}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 MainMenu                                   */
/* -------------------------------------------------------------------------- */

const MainMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /* --------------------------------- Auth --------------------------------- */
  const { accessToken, member } = useSelector((state) => state.authSlice);
  const isLogin = Boolean(accessToken || member?.accessToken);

  /* ----------------------------- Categories ---------------------------- */
  const { categories, categoryIds, loading: categoriesLoading } = useCategory();

  /* ----------------------------- Scroll Effect ---------------------------- */
  const [hideSearch, setHideSearch] = useState(false);

  useEffect(() => {
    const onScroll = () => setHideSearch(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

      // 음성 인식 시작
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setInterimText("");
        console.log("음성 인식 시작");
      };

      // 음성 인식 결과
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          // 최종 결과가 있으면 검색 실행
          setInterimText("");
          setIsListening(false);
          setShowVoiceSearchBox(false);

          // 자동으로 검색 실행
          setTimeout(() => {
            handleVoiceSearchWithText(finalTranscript);
          }, 500);
        } else {
          // 중간 결과 표시
          setInterimText(interimTranscript);
        }
      };

      // 음성 인식 종료
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimText("");
        console.log("음성 인식 종료");
      };

      // 오류 처리
      recognitionRef.current.onerror = (event) => {
        console.error("음성 인식 오류:", event.error);
        setIsListening(false);
        setInterimText("");

        if (event.error === "no-speech") {
          alert("음성이 감지되지 않았습니다. 다시 시도해주세요.");
        } else if (event.error === "audio-capture") {
          alert("마이크에 접근할 수 없습니다. 브라우저 설정을 확인해주세요.");
        } else {
          alert("음성 인식 중 오류가 발생했습니다.");
        }
      };
    } else {
      console.warn("이 브라우저는 Web Speech API를 지원하지 않습니다.");
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  /* ----------------------------- Dropdown State ---------------------------- */
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);

  /* ------------------------------- UI State ------------------------------ */
  const { items: cartItems } = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  useEffect(() => {
    if (isLogin) {
      dispatch(fetchCartItems());
    }
  }, [dispatch, isLogin]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [showImageSearchBox, setShowImageSearchBox] = useState(false);
  const [showVoiceSearchBox, setShowVoiceSearchBox] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const recognitionRef = useRef(null);

  const navItemStyle =
    "relative text-white font-bold transition-all duration-300 hover:scale-105 hover:text-black after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-black hover:after:w-full after:transition-all after:duration-300";

  /* ------------------------------ Handlers ------------------------------- */
  const handleLogout = useCallback(() => {
    console.log("handleLogout 실행");
    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Auth.logout(() => {
        console.log("카카오 SDK 로그아웃");
        dispatch(logoutAsync());
        navigate("/main");
      });
    } else {
      console.log("카카오 SDK 준비 안 됨");
      dispatch(logoutAsync());
      navigate("/main");
    }
  }, [dispatch, navigate]);

  const handleCartClick = useCallback(() => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      navigate("/member/login");
    } else {
      navigate("/cart");
    }
  }, [isLogin, navigate]);

  /* ----------------------------- Dropdown Handlers ---------------------------- */
  const handleCategoryMouseEnter = useCallback(() => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setShowDropdown(true);
  }, [dropdownTimeout]);

  const handleCategoryMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => {
      setShowDropdown(false);
      setHoveredCategory(null);
    }, 100); // 100ms로 단축
    setDropdownTimeout(timeout);
  }, []);

  const handleSubCategoryHover = useCallback(
    (category) => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
        setDropdownTimeout(null);
      }
      setHoveredCategory(category);
    },
    [dropdownTimeout]
  );

  const handleCategoryClick = useCallback(
    (mainCategory, subCategory) => {
      setShowDropdown(false);
      setHoveredCategory(null);
      const categoryData = categoryIds[mainCategory];
      if (categoryData) {
        if (subCategory) {
          // 서브 카테고리가 선택된 경우
          const subId = categoryData.subCategories[subCategory];
          if (subId) {
            navigate(`/category/${categoryData.id}/${subId}`);
          } else {
            console.error("세부 카테고리 ID를 찾을 수 없습니다:", subCategory);
          }
        } else {
          // 메인 카테고리만 선택된 경우
          navigate(`/category/${categoryData.id}`);
        }
      } else {
        console.error("주요 카테고리 ID를 찾을 수 없습니다:", mainCategory);
      }
    },
    [navigate, categoryIds]
  );

  // 텍스트로 음성 검색 처리
  const handleVoiceSearchWithText = useCallback(
    async (text) => {
      try {
        if (text && text.trim()) {
          // 검색 결과 페이지로 이동
          navigate("/search", {
            state: {
              keyword: text.trim(),
              searchType: "products",
              isVoiceSearch: true,
            },
          });
        } else {
          alert("음성을 인식하지 못했습니다. 다시 시도해주세요.");
        }
      } catch (error) {
        console.error("음성 검색 실패:", error);
        alert("음성 검색 중 오류가 발생했습니다.");
      }
    },
    [navigate]
  );

  // 음성 검색 처리 (기존 API 방식)
  const handleVoiceSearch = useCallback(
    async (audioBlob) => {
      try {
        // 로딩 표시
        const loadingDiv = document.createElement("div");
        loadingDiv.id = "voice-search-loading";
        loadingDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; justify-content: center; align-items: center;">
          <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="margin-bottom: 10px;">음성 인식 중...</            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
        document.body.appendChild(loadingDiv);

        // 음성 검색 API 호출
        const result = await speechSearch(audioBlob);

        // 로딩 제거
        document.body.removeChild(loadingDiv);

        if (result.success && result.keyword) {
          // 검색 결과 페이지로 이동
          navigate("/search", {
            state: {
              keyword: result.keyword,
              searchType: "products",
              isVoiceSearch: true,
            },
          });
        } else {
          alert("음성을 인식하지 못했습니다. 다시 시도해주세요.");
        }
      } catch (error) {
        // 로딩 제거
        const loadingDiv = document.getElementById("voice-search-loading");
        if (loadingDiv) {
          document.body.removeChild(loadingDiv);
        }

        console.error("음성 검색 실패:", error);
        alert("음성 검색 중 오류가 발생했습니다.");
      }

      setShowVoiceSearchBox(false);
    },
    [navigate]
  );

  // 음성 인식 시작
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("음성 인식 시작 실패:", error);
        alert("음성 인식을 시작할 수 없습니다.");
      }
    }
  };

  // 음성 인식 중지
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // 음성 검색 오류 처리
  const handleVoiceSearchError = useCallback((error) => {
    alert(error);
    setShowVoiceSearchBox(false);
  }, []);

  // 이미지 검색 파일 선택
  const handleImageSearch = useCallback(
    async (file) => {
      if (!file) return;

      // 파일 유효성 검사
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("이미지 파일 크기는 10MB 이하여야 합니다.");
        return;
      }

      try {
        // 로딩 표시
        const loadingDiv = document.createElement("div");
        loadingDiv.id = "image-search-loading";
        loadingDiv.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; justify-content: center; align-items: center;">
            <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
              <div style="margin-bottom: 10px;">이미지 분석 중...</div>
              <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;
        document.body.appendChild(loadingDiv);

        // 이미지 분석 API 호출
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(
          "http://localhost:8080/api/vision/analyze-clothing",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("이미지 분석에 실패했습니다.");
        }

        const result = await response.json();

        // 로딩 제거
        document.body.removeChild(loadingDiv);

        // 분석 결과에 따라 상품 검색
        if (
          result &&
          result.clothingType &&
          result.clothingType !== "분류 안됨" &&
          result.clothingType !== "임산복/아동복 - 검색 제한"
        ) {
          // 분석된 옷 종류로 검색 페이지로 이동
          navigate("/search", {
            state: {
              keyword: result.clothingType,
              searchType: "products",
              isImageSearch: true,
            },
          });
        } else {
          alert(
            "이미지에서 옷을 인식하지 못했습니다. 다른 이미지를 시도해주세요."
          );
        }
      } catch (error) {
        console.error("이미지 검색 오류:", error);
        alert("이미지 검색 중 오류가 발생했습니다.");

        // 로딩 제거
        const loadingDiv = document.getElementById("image-search-loading");
        if (loadingDiv) {
          document.body.removeChild(loadingDiv);
        }
      } finally {
        setShowImageSearchBox(false);
      }
    },
    [navigate]
  );

  const handleFileInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageSearch(file);
      }
    },
    [handleImageSearch]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        handleImageSearch(file);
      }
    },
    [handleImageSearch]
  );

  // 클립보드 붙여넣기 처리
  const handlePaste = useCallback(
    async (e) => {
      if (!showImageSearchBox) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let item of items) {
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleImageSearch(file);
            break;
          }
        }
      }
    },
    [showImageSearchBox, handleImageSearch]
  );

  // 클립보드 이벤트 리스너 등록
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      if (showImageSearchBox) {
        handlePaste(e);
      }
    };

    document.addEventListener("paste", handleGlobalPaste);
    return () => {
      document.removeEventListener("paste", handleGlobalPaste);
    };
  }, [showImageSearchBox, handlePaste]);

  // 경로 변경 시 검색어 초기화
  useEffect(() => {
    // 검색 페이지가 아닌 다른 곳으로 이동했을 때 검색어 초기화
    if (location.pathname !== "/search") {
      setSearchKeyword("");
    }
  }, [location.pathname]);

  // 검색 처리 함수
  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    try {
      // 검색 결과 페이지로 이동하면서 검색어 전달
      navigate("/search", {
        state: {
          keyword: searchKeyword.trim(),
          searchType: "products",
        },
      });
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert("검색 중 오류가 발생했습니다.");
    }
  }, [searchKeyword, navigate]);

  // 엔터키 검색 처리
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  /* -------------------------------- Render -------------------------------- */
  return (
    <>
      <style>{dropdownStyles}</style>
      <nav className="fixed inset-x-0 top-0 z-50 text-gray-400 transition-all duration-300">
        {/* 메인 메뉴 크기 조절 */}
        <div className="mx-auto max-w-[1440px] px-6 py-6 bg-green-500 bg-opacity-80 text-gray-400">
          {/* 헤더 1행 : 로고 & 우측 메뉴 */}
          <div className="mb-3 flex items-center justify-between">
            <Logo />

            <ul className="flex items-center gap-3 text-lg">
              {isLogin ? (
                <li>
                  <button onClick={handleLogout} className={navItemStyle}>
                    로그아웃
                  </button>
                </li>
              ) : (
                <li>
                  <Link to="/member/login" className={navItemStyle}>
                    로그인
                  </Link>
                </li>
              )}
              <li>
                <Link to="/member/mypage" className={navItemStyle}>
                  마이페이지
                </Link>
              </li>
              <li>
                <Link to="/like" className={navItemStyle}>
                  좋아요
                </Link>
              </li>
              <li>
                <button onClick={handleCartClick} className={navItemStyle}>
                  장바구니
                  {isLogin && cartCount > 0 && (
                    <span className="ml-1 font-bold text-blue-400">
                      ({cartCount})
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>

          {/* 2단: 검색창 + 이미지검색 버튼 분리 */}
          <div
            className={`mb-3 flex w-full items-center gap-2 transition-[max-height,opacity,padding] duration-300 ease-in-out ${
              hideSearch
                ? "max-h-0 py-0 opacity-0"
                : "max-h-12 py-1.5 opacity-100"
            }`}
          >
            {/* 검색창 + 오른쪽 카메라 아이콘 버튼 */}
            <div className="relative flex-grow">
              {/* 돋보기 아이콘 (왼쪽) - 클릭 가능한 검색 버튼 */}
              <button
                onClick={handleSearch}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="검색 버튼"
              >
                <FiSearch className="text-lg" />
              </button>
              {/* 검색 input */}
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* 음성 검색 버튼 (오른쪽) */}
              <button
                onClick={() => setShowVoiceSearchBox(!showVoiceSearchBox)}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                aria-label="음성 검색"
              >
                <FiMic className="text-lg" />
              </button>

              {/* 카메라 아이콘 (오른쪽) */}
              <button
                onClick={() => setShowImageSearchBox((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xl text-gray-700 hover:text-black"
                aria-label="이미지 검색 버튼"
              >
                📷
              </button>
            </div>

            {/* 음성 검색 드롭다운 */}
            <div className="relative">
              {showVoiceSearchBox && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded border border-gray-300 bg-white p-4 text-black shadow-lg z-50">
                  <h4 className="mb-2 text-lg font-bold">음성으로 검색하기</h4>
                  <p className="mb-1 text-sm leading-relaxed">
                    🎤 마이크 버튼을 눌러 검색하고 싶은 상품명을 말씀해주세요.
                  </p>
                  <p className="mb-1 text-sm leading-relaxed">
                    1. "음성 인식 시작" 버튼을 눌러 음성 인식을 시작하세요.
                  </p>
                  <p className="mb-1 text-sm leading-relaxed">
                    2. "티셔츠", "청바지" 등 원하는 상품명을 말씀하세요.
                  </p>
                  <p className="mb-1 text-sm leading-relaxed">
                    3. 말이 끝나면 자동으로 검색 결과 페이지로 이동합니다.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    * 정확한 인식을 위해 명확하게 발음해주세요.
                  </p>

                  {/* 음성 인식 버튼 */}
                  <div className="mt-4 flex flex-col items-center space-y-3">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`flex items-center justify-center w-16 h-16 rounded-full transition-colors duration-200 border-none ${
                        isListening
                          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                      title={isListening ? "음성 인식 중지" : "음성 인식 시작"}
                    >
                      {isListening ? (
                        <FaStop size={24} />
                      ) : (
                        <FaMicrophone size={24} />
                      )}
                    </button>

                    {/* 음성 인식 상태 표시 */}
                    {isListening && (
                      <div className="flex items-center text-red-500 text-sm font-semibold">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                        듣는 중...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 이미지 검색 버튼 */}
            <div className="relative">
              {/* 이미지 검색 안내 박스 */}
              {showImageSearchBox && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded border border-gray-300 bg-white p-4 text-black shadow-lg z-50">
                  <h4 className="mb-2 text-lg font-bold">
                    이미지로 옷 검색하기
                  </h4>
                  <p className="mb-1 text-sm leading-relaxed">
                    📷 사진을 업로드하면 비슷한 스타일의 옷을 빠르게 찾을 수
                    있습니다.
                  </p>

                  {/* 드래그 앤 드롭 영역 */}
                  <div
                    className={`mt-3 p-4 border-2 border-dashed rounded-lg text-center transition-all duration-200 ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="text-gray-600 mb-2">
                      <div className="text-2xl mb-1">📁</div>
                      <div className="text-sm">
                        {isDragOver
                          ? "여기에 파일을 놓으세요"
                          : "파일을 여기에 드래그하거나"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Ctrl+V로 클립보드 이미지 붙여넣기 가능
                      </div>
                    </div>

                    {/* 파일 선택 input */}
                    <label
                      htmlFor="image-search-upload"
                      className="inline-block cursor-pointer rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      사진 선택
                    </label>
                    <input
                      id="image-search-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>

                  <p className="mb-1 text-sm leading-relaxed mt-3">
                    1. 파일을 드래그해서 위 영역에 놓거나 "사진 선택" 버튼을
                    클릭하세요.
                  </p>
                  <p className="mb-1 text-sm leading-relaxed">
                    2. 스마트폰으로 촬영한 사진도 바로 업로드 가능합니다.
                  </p>
                  <p className="mb-1 text-sm leading-relaxed">
                    3. 업로드 후 관련 상품 페이지로 자동 이동합니다.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    * 네트워크 상태에 따라 검색에 시간이 걸릴 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3단: 좌측 카테고리 메뉴 */}
          <ul className="flex gap-6 text-base md:text-xl">
            {LEFT_MENU_ITEMS.map(({ to, label, hasDropdown }) => (
              <li key={to}>
                {hasDropdown ? (
                  <div
                    onMouseEnter={handleCategoryMouseEnter}
                    onMouseLeave={handleCategoryMouseLeave}
                    className="relative text-white font-bold transition-all duration-300 hover:scale-105 hover:text-black"
                  >
                    <span
                      className="text-2xl"
                      style={{ position: "relative", top: "-0.2rem" }}
                    >
                      {label}
                    </span>
                    <span
                      className={`absolute left-0 bottom-0 h-0.5 bg-black transition-all duration-300 ${
                        showDropdown ? "w-full" : "w-0 hover:w-full"
                      }`}
                    />

                    <CategoryDropdown
                      showDropdown={showDropdown}
                      hoveredCategory={hoveredCategory}
                      categories={categories}
                      onCategoryHover={handleSubCategoryHover}
                      onMouseLeave={handleCategoryMouseLeave}
                      onCategoryClick={handleCategoryClick}
                    />
                  </div>
                ) : (
                  <Link to={to} className={navItemStyle}>
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default MainMenu;
