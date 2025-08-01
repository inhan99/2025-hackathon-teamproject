import React, { useState, useCallback, useEffect, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import { GiRecycle } from "react-icons/gi";
import { FaTshirt, FaAngleDown } from "react-icons/fa";
import { logout } from "../../slices/authSlice";

// 하위 카테고리 목록
const SHARING_SUB_CATEGORIES = [
  { to: "/sharing/all", label: "전체" },
  { to: "/sharing/top", label: "상의" },
  { to: "/sharing/bottom", label: "하의" },
  { to: "/sharing/maternity", label: "임산부" },
  { to: "/sharing/infant", label: "영유아" },
];

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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black"
      />
    </div>
    <span className="text-3xl font-[Bebas Neue] font-bold leading-none text-white">
      REFIT SHARING
    </span>
  </Link>
));

const LEFT_MENU_ITEMS = [
  { to: "/sharing", label: "나눔" },
  { to: "/recommend", label: "추천" },
  { to: "/ranking", label: "랭킹" },
  { to: "/sale", label: "세일" },
  { to: "/brand", label: "브랜드" },
  { to: "/community", label: "커뮤니티" },
];

const MainMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { accessToken, member } = useSelector((state) => state.authSlice);
  const isLogin = Boolean(accessToken || member?.accessToken);

  const [hideSearch, setHideSearch] = useState(false);
  const [cartCount] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [showImageSearchBox, setShowImageSearchBox] = useState(false);
  const [showSharingCategories, setShowSharingCategories] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const onScroll = () => setHideSearch(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/main");
  }, [dispatch, navigate]);

  const handleCartClick = useCallback(() => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      navigate("/member/login");
    } else {
      navigate("/cart");
    }
  }, [isLogin, navigate]);

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

      setImageFile(file);

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch(
          "http://localhost:8080/api/vision/analyze-clothing",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();
        console.log("이미지 검색 결과:", data);

        if (
          data?.clothingType &&
          data.clothingType !== "분류 안됨" &&
          data.clothingType !== "임산복/아동복 - 검색 제한"
        ) {
          // 분석된 옷 종류로 검색 페이지로 이동
          navigate("/search", {
            state: {
              keyword: data.clothingType,
              searchType: "products",
              isImageSearch: true,
            },
          });
        } else {
          alert(
            "이미지에서 옷을 인식하지 못했습니다. 다른 이미지를 시도해주세요."
          );
        }
      } catch (err) {
        console.error(err);
        alert("이미지 검색 중 오류가 발생했습니다.");
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

  const navItemStyle =
    "relative text-white font-bold transition-all duration-300 hover:scale-105 hover:text-black after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-black hover:after:w-full after:transition-all after:duration-300";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 text-white transition-all duration-300">
      <div className="mx-auto max-w-[1440px] px-6 py-6 bg-blue-500 bg-opacity-60">
        {/* 1단: 로고 & 우측 메뉴 */}
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
                  <span className="ml-1 font-bold text-red-400">
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
            {/* 돋보기 아이콘 (왼쪽) */}
            <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

            {/* 검색 input */}
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="w-full h-9 border border-gray-300 bg-white pl-8 pr-10 text-base text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            {/* 카메라 아이콘 (오른쪽) */}
            <button
              onClick={() => setShowImageSearchBox((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xl text-gray-700 hover:text-black"
              aria-label="이미지 검색 버튼"
            >
              📷
            </button>
          </div>

          {/* 이미지 검색 버튼 */}
          <div className="relative">
            {/* 이미지 검색 안내 박스 */}
            {showImageSearchBox && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded border border-gray-300 bg-white p-4 text-black shadow-lg z-50">
                <h4 className="mb-2 text-lg font-bold">이미지로 옷 검색하기</h4>
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

        {/* 이미지 업로드 미리보기 */}
        {imageFile && (
          <div className="mb-3">
            <p className="text-sm text-white">업로드한 이미지 미리보기</p>
            <img
              src={URL.createObjectURL(imageFile)}
              alt="업로드한 이미지"
              className="mt-1 h-24 rounded-md border border-gray-300"
            />
          </div>
        )}

        {/* 3단: 좌측 카테고리 메뉴 */}
        <ul className="flex gap-6 text-base md:text-xl items-center relative">
          {LEFT_MENU_ITEMS.map(({ to, label }) => {
            if (to === "/sharing") {
              return (
                <li key={to} className="relative flex items-center gap-2">
                  {/* 나눔 햄버거 버튼 */}
                  <button
                    onClick={() => setShowSharingCategories((prev) => !prev)}
                    className="text-white hover:text-black transition-colors duration-200 p-2 rounded text-2xl"
                    style={{ position: "relative", top: "-0.2rem" }}
                    aria-label="나눔 메뉴 열기"
                  >
                    ☰
                  </button>

                  {/* 나눔 메인 링크 */}
                  <Link to={to} className={navItemStyle}>
                    {label}
                  </Link>

                  {/* 햄버거 클릭 시 나오는 하위 카테고리 메뉴 */}
                  {showSharingCategories && (
                    <ul className="absolute left-0 top-full mt-2 bg-white rounded shadow-md z-50 flex flex-col w-32 text-black animate-fade-in-down">
                      {SHARING_SUB_CATEGORIES.map(({ to: subTo, label }) => {
                        const isActive = location.pathname === subTo;
                        return (
                          <li key={subTo}>
                            <Link
                              to={subTo}
                              className={`block px-4 py-2 hover:bg-gray-200 ${
                                isActive
                                  ? "text-blue-600 font-semibold underline"
                                  : ""
                              }`}
                              onClick={() => setShowSharingCategories(false)}
                            >
                              {label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={to}>
                <Link to={to} className={navItemStyle}>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default MainMenu;
