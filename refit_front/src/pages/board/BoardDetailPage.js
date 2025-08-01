import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchPostByIdAndType, deletePostByType } from "../../api/boardApi";
import CommentSection from "../../components/board/CommentSection";
import { useSelector } from "react-redux";

const BoardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // 현재 페이지 정보 state/쿼리에서 추출
  const page =
    location.state?.page ??
    new URLSearchParams(location.search).get("page") ??
    0;

  const [post, setPost] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const imageSliderRef = useRef(null);

  // 인증 상태 확인
  const auth = useSelector((state) => state.authSlice);
  const currentUser = auth && auth.member ? auth.member.username : null;
  const currentNickname = auth && auth.member ? auth.member.nickname : null;

  // 작성자 여부 확인 (username과 nickname 모두 확인)
  const isAuthor =
    post &&
    (currentUser || currentNickname) &&
    (post.writer === currentUser || post.writer === currentNickname);

  // 디버깅용 로그
  console.log("🔍 디버깅 정보:", {
    auth,
    currentUser,
    currentNickname,
    postWriter: post?.writer,
    isAuthor,
    post: post,
  });

  // 현재 URL에서 게시판 타입 추출
  const getBoardType = () => {
    const path = location.pathname;
    if (path.includes("/boards/freedom")) return "freedom";
    if (path.includes("/boards/secret")) return "secret";
    if (path.includes("/boards/share")) return "share";
    return "freedom"; // 기본값
  };

  useEffect(() => {
    const loadPost = async () => {
      try {
        const boardType = getBoardType();
        const res = await fetchPostByIdAndType(boardType, id);
        setPost(res.data);
      } catch (error) {
        console.error("상세 게시글 불러오기 실패:", error);
        alert("게시글을 불러오는 데 실패했습니다.");
        navigate(`/boards/${getBoardType()}`);
      }
    };

    loadPost();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const boardType = getBoardType();
      await deletePostByType(boardType, id);
      alert("삭제되었습니다.");
      navigate(`/boards/${boardType}`);
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (post.images && currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleImageClick = () => {
    if (post.images && post.images.length > 0) {
      setShowLightbox(true);
    }
  };

  const handleLightboxClose = () => {
    setShowLightbox(false);
  };

  const handleLightboxPrev = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleLightboxNext = () => {
    if (post.images && currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  // ESC 키로 라이트박스 닫기
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setShowLightbox(false);
      }
    };

    if (showLightbox) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [showLightbox]);

  if (!post) return <div className="text-center py-10">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-52 max-w-[1440px] mx-auto py-4 bg-[#ffffff] border-l-4 border-r-4">
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* 메인 컨테이너 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 이미지 슬라이더 */}
          {post.images && post.images.length > 0 && (
            <div className="relative bg-gray-100">
              <div
                className="aspect-[4/3] relative overflow-hidden cursor-pointer"
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
                onClick={handleImageClick}
              >
                <img
                  ref={imageSliderRef}
                  src={`http://localhost:8080/uploads/${post.images[currentImageIndex].imageUrl}`}
                  alt={`이미지 ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: "auto" }}
                />

                {/* 이미지 개수 표시 - 오른쪽 아래 */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {post.images.length}
                </div>

                {/* 이전/다음 버튼 - 호버 시에만 표시 */}
                {post.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      disabled={currentImageIndex === 0}
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-60 text-white rounded-full flex items-center justify-center transition-all duration-300 ${
                        isImageHovered
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-90"
                      } hover:bg-opacity-80 disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      disabled={currentImageIndex === post.images.length - 1}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-60 text-white rounded-full flex items-center justify-center transition-all duration-300 ${
                        isImageHovered
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-90"
                      } hover:bg-opacity-80 disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* 더블클릭 안내 */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs opacity-0 hover:opacity-100 transition-opacity duration-300">
                  더블클릭하여 원본 보기
                </div>
              </div>

              {/* 이미지 썸네일 */}
              {post.images.length > 1 && (
                <div className="p-4 bg-white">
                  <div className="flex gap-2 overflow-x-auto">
                    {post.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          index === currentImageIndex
                            ? "border-blue-500"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={`http://localhost:8080/uploads/${image.imageUrl}`}
                          alt={`썸네일 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 게시글 내용 */}
          <div className="p-6">
            {/* 헤더 정보 */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {post.title}
              </h1>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {getBoardType() === "secret" ? "익명" : post.writer}
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString("ko-KR")
                      : "시간 정보 없음"}
                  </span>
                  {post.updatedAt && post.updatedAt !== post.createdAt && (
                    <span className="text-blue-600">수정됨</span>
                  )}
                </div>
              </div>
            </div>

            {/* 게시글 내용 */}
            <div className="mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <button
                onClick={() =>
                  navigate(`/boards/${getBoardType()}?page=${page}`, {
                    state: { page },
                  })
                }
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                목록으로
              </button>

              {isAuthor && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>
                      navigate(`/boards/${getBoardType()}/modify/${id}`, {
                        state: { page },
                      })
                    }
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-6">
          <CommentSection postId={id} boardType={getBoardType()} />
        </div>
      </div>

      {/* 라이트박스 모달 */}
      {showLightbox && post.images && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            {/* 닫기 버튼 */}
            <button
              onClick={handleLightboxClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* 이미지 */}
            <img
              src={`http://localhost:8080/uploads/${post.images[currentImageIndex].imageUrl}`}
              alt={`원본 이미지 ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              style={{ imageRendering: "auto" }}
            />

            {/* 이미지 정보 */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {post.images.length}
            </div>

            {/* 이전/다음 버튼 */}
            {post.images.length > 1 && (
              <>
                <button
                  onClick={handleLightboxPrev}
                  disabled={currentImageIndex === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-60 text-white rounded-full flex items-center justify-center hover:bg-opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleLightboxNext}
                  disabled={currentImageIndex === post.images.length - 1}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-60 text-white rounded-full flex items-center justify-center hover:bg-opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDetailPage;
