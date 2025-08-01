import React, { useEffect, useState, useRef } from "react";
import {
  fetchPostsByType,
  fetchPostsWithCommentCountByType,
  fetchPostsByTypeWithPaging,
  fetchCommentsByType,
} from "../../api/boardApi";
import { Link, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useSelector } from "react-redux";

const SecretBoardPage = () => {
  const location = useLocation();
  const queryPage = new URLSearchParams(location.search).get("page");
  const statePage = location.state?.page;
  const initialPage = Number(queryPage ?? statePage ?? 0);

  // 인증 상태 확인
  const auth = useSelector((state) => state.authSlice);
  const isLoggedIn = auth && auth.member && auth.member.username;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // 이미지 슬라이드 컴포넌트
  const ImageSlider = ({ images, postId }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [dragDistance, setDragDistance] = useState(0);
    const scrollContainerRef = useRef(null);

    // 이미지가 1개인 경우 단일 이미지로 표시
    if (images.length === 1) {
      return (
        <div
          className="single-image-container"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="single-image-content">
            <img
              src={`http://localhost:8080/uploads/${images[0].imageUrl}`}
              alt="이미지"
              className="single-image"
              draggable={false}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          </div>
        </div>
      );
    }

    // 이미지가 2개인 경우 2개 이미지로 표시
    if (images.length === 2) {
      return (
        <div
          className="double-image-container"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="double-image-content">
            {images.map((image, index) => (
              <img
                key={index}
                src={`http://localhost:8080/uploads/${image.imageUrl}`}
                alt={`이미지 ${index + 1}`}
                className="double-image"
                draggable={false}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            ))}
          </div>
        </div>
      );
    }

    const handleMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsMouseDown(true);
      setIsDragging(true);
      setDragDistance(0);
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
      setIsMouseDown(false);
      setIsDragging(false);
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsMouseDown(false);
      // 드래그 거리가 10px 이상이면 클릭 이벤트 차단
      if (Math.abs(dragDistance) > 10) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      setIsDragging(false);
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown || !isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 1.5; // 드래그 속도 조절
      const currentDragDistance = x - startX;
      setDragDistance(currentDragDistance);
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsMouseDown(true);
      setIsDragging(true);
      setDragDistance(0);
      setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleTouchMove = (e) => {
      if (!isMouseDown || !isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 1.5;
      const currentDragDistance = x - startX;
      setDragDistance(currentDragDistance);
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsMouseDown(false);
      // 드래그 거리가 10px 이상이면 클릭 이벤트 차단
      if (Math.abs(dragDistance) > 10) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      setIsDragging(false);
    };

    const handleDotClick = (index) => {
      const imageWidth = 128; // 120px + 8px gap
      const visibleImages = 2; // 한 번에 2개씩 보임
      const scrollAmount = index * imageWidth * visibleImages;
      scrollContainerRef.current.scrollLeft = scrollAmount;
      setCurrentIndex(index);
    };

    const handleArrowClick = (direction) => {
      const imageWidth = 128; // 120px + 8px gap
      const visibleImages = 2; // 한 번에 2개씩 보임
      const maxIndex = Math.ceil(images.length / visibleImages) - 1;

      const newIndex =
        direction === "next"
          ? Math.min(currentIndex + 1, maxIndex)
          : Math.max(currentIndex - 1, 0);

      const scrollAmount = newIndex * imageWidth * visibleImages;
      scrollContainerRef.current.scrollLeft = scrollAmount;
      setCurrentIndex(newIndex);
    };

    return (
      <div
        className="image-slider-container"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // 드래그 거리가 10px 이상이면 클릭 이벤트 차단
          if (Math.abs(dragDistance) > 10) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }}
      >
        {/* 슬라이드 화살표 */}
        <button
          className={`slide-arrow left ${
            currentIndex === 0 ? "opacity-30 cursor-not-allowed" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (currentIndex > 0) {
              handleArrowClick("prev");
            }
          }}
          disabled={currentIndex === 0}
        >
          <svg
            className="w-3 h-3"
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
          className={`slide-arrow right ${
            currentIndex >= Math.ceil(images.length / 2) - 1
              ? "opacity-30 cursor-not-allowed"
              : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (currentIndex < Math.ceil(images.length / 2) - 1) {
              handleArrowClick("next");
            }
          }}
          disabled={currentIndex >= Math.ceil(images.length / 2) - 1}
        >
          <svg
            className="w-3 h-3"
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

        {/* 이미지 슬라이드 */}
        <div
          ref={scrollContainerRef}
          className="image-slider-content board-image-scroll"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="image-slider-item"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <img
                src={`http://localhost:8080/uploads/${image.imageUrl}`}
                alt={`이미지 ${index + 1}`}
                className="image-slider-image"
                draggable={false}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </div>
          ))}
        </div>

        {/* 슬라이드 점 인디케이터 */}
        {images.length > 2 && (
          <div className="slide-nav">
            {Array.from({ length: Math.ceil(images.length / 2) }).map(
              (_, index) => (
                <button
                  key={index}
                  className={`slide-dot ${
                    index === currentIndex ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDotClick(index);
                  }}
                />
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const loadPosts = (page = 0) => {
    setLoading(true);
    setError(null);

    // 페이징 API 시도
    fetchPostsByTypeWithPaging("secret", page, pageSize)
      .then((res) => {
        console.log("API 응답:", res.data);
        if (res && res.data) {
          if (res.data.boards) {
            // 페이징 응답인 경우
            console.log("페이징 응답 감지");
            setPosts(res.data.boards);
            // 현재 페이지는 요청한 페이지로 유지 (서버 응답이 아닌)
            setCurrentPage(page);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
          } else {
            // 기존 응답인 경우
            console.log("기존 응답 감지");
            setPosts(res.data);
            setCurrentPage(page);
            setTotalPages(1);
            setTotalElements(res.data.length);
          }
          setLoading(false);
        } else {
          throw new Error("데이터가 없습니다.");
        }
      })
      .catch((error) => {
        console.log("페이징 API 실패, 기본 API 사용:", error);
        // 실패하면 기본 API로 게시글만 가져오고 댓글 개수는 0으로 표시
        return fetchPostsByType("secret");
      })
      .then((res) => {
        if (res && res.data) {
          // 기본 API로 가져온 경우 댓글 개수를 0으로 설정
          const postsWithDefaultCommentCount = res.data.map((post) => ({
            ...post,
            commentCount: 0,
          }));
          setPosts(postsWithDefaultCommentCount);
          setCurrentPage(page);
          setTotalPages(1);
          setTotalElements(res.data.length);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("게시글을 불러오는 데 실패했습니다.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-52 max-w-[1440px] mx-auto py-4 bg-[#ffffff] border-l-4 border-r-4">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">비밀게시판</h1>
            <p className="text-gray-600 mt-1">
              익명으로 자유롭게 이야기를 나누는 공간
            </p>
          </div>
          {isLoggedIn && (
            <Link
              to="/boards/secret/write"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              글쓰기
            </Link>
          )}
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <Link
                to={`/boards/secret/post/${post.id}`}
                state={{ page: currentPage }}
                className="block p-4"
              >
                <div className="flex items-start justify-between">
                  {/* 왼쪽 내용 */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center text-blue-600 text-xs">
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
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          {post.commentCount || 0}
                        </span>
                        {post.updatedAt &&
                          post.updatedAt !== post.createdAt && (
                            <span className="text-blue-600 text-xs">
                              수정됨
                            </span>
                          )}
                      </div>
                      <span className="flex items-center text-xs text-gray-500">
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
                      <span className="flex items-center text-xs text-gray-500">
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
                        익명
                      </span>
                    </div>
                  </div>

                  {/* 오른쪽 이미지 */}
                  {post.images && post.images.length > 0 && (
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img
                          src={`http://localhost:8080/uploads/${post.images[0].imageUrl}`}
                          alt="대표 이미지"
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                        {post.images.length > 1 && (
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {post.images.length}+
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {posts.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              아직 게시글이 없습니다
            </h3>
            <p className="text-gray-600">첫 번째 게시글을 작성해보세요!</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => loadPosts(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => loadPosts(pageNum)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            <button
              onClick={() => loadPosts(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretBoardPage;
