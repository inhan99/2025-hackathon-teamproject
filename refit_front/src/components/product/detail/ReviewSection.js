import React, { useState, useEffect } from "react";
import {
  getReviewsByProductId,
  getReviewsByProductIdWithSort,
  deleteReview,
} from "../../../api/reviewApi";
import { getCookie } from "../../../util/cookieUtil";
import {
  FaStar,
  FaTrash,
  FaEdit,
  FaSort,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import { API_SERVER_HOST } from "../../../api/productsApi";

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]); // 모든 리뷰 저장
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [sortBy, setSortBy] = useState("latest"); // latest: 최신순, rating_desc: 평점높은순, rating_asc: 평점낮은순
  const [ratingFilter, setRatingFilter] = useState(0); // 0: 전체, 1-5: 해당 평점
  const [expandedImage, setExpandedImage] = useState(null); // 이미지 확대 상태

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsData = await getReviewsByProductId(productId);
        console.log("받아온 리뷰 데이터:", reviewsData);
        console.log("데이터 타입:", typeof reviewsData);
        console.log("배열인지 확인:", Array.isArray(reviewsData));

        // 배열이 아닌 경우 빈 배열로 설정
        if (Array.isArray(reviewsData)) {
          setAllReviews(reviewsData);
          setReviews(reviewsData);
        } else {
          console.warn("리뷰 데이터가 배열이 아닙니다:", reviewsData);
          // 에러 응답인 경우 빈 배열로 설정
          if (reviewsData && reviewsData.error) {
            console.warn("서버 에러:", reviewsData.error);
          }
          setAllReviews([]);
          setReviews([]);
        }
      } catch (error) {
        console.error("리뷰 조회 실패:", error);
        console.error("에러 상세:", error.response?.data);
        console.error("에러 상태:", error.response?.status);
        console.error("에러 메시지:", error.message);

        // 네트워크 에러나 서버 에러인 경우 빈 배열로 설정
        setAllReviews([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    // 현재 사용자 이메일 가져오기
    const getUserEmailFromCookie = () => {
      const token = getCookie("member")?.accessToken;
      if (!token) return null;
      try {
        const payload = JSON.parse(
          atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );
        return payload.sub || payload.email || null;
      } catch (error) {
        return null;
      }
    };

    setCurrentUserEmail(getUserEmailFromCookie());
    fetchReviews();
  }, [productId]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;

    try {
      await deleteReview(reviewId);
      // 리뷰 목록에서 삭제된 리뷰 제거
      setAllReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId)
      );
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId)
      );
      alert("리뷰가 삭제되었습니다.");
    } catch (error) {
      alert("리뷰 삭제에 실패했습니다: " + error.message);
    }
  };

  const handleImageClick = (imageUrl) => {
    setExpandedImage(expandedImage === imageUrl ? null : imageUrl);
  };

  // 정렬 및 필터링 적용
  useEffect(() => {
    let filteredReviews = [...allReviews];

    // 평점 필터링
    if (ratingFilter > 0) {
      filteredReviews = filteredReviews.filter(
        (review) => Math.floor(review.rating) === ratingFilter
      );
    }

    // 정렬 적용
    switch (sortBy) {
      case "rating_desc":
        filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case "rating_asc":
        filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
      case "latest":
      default:
        filteredReviews.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
    }

    setReviews(filteredReviews);
  }, [allReviews, sortBy, ratingFilter]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`inline-block ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">리뷰</h3>
        <div className="text-center py-8">리뷰를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">리뷰 ({reviews.length}개)</h3>
      </div>

      {/* 정렬 및 필터링 탭 */}
      <div className="mb-6">
        {/* 정렬 탭 */}
        <div className="flex items-center mb-4">
          <FaSort className="text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700 mr-3">정렬:</span>
          <div className="flex space-x-1">
            <button
              onClick={() => setSortBy("latest")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                sortBy === "latest"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy("rating_desc")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                sortBy === "rating_desc"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              평점높은순
            </button>
            <button
              onClick={() => setSortBy("rating_asc")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                sortBy === "rating_asc"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              평점낮은순
            </button>
          </div>
        </div>

        {/* 평점 필터 탭 */}
        <div className="flex items-center">
          <FaFilter className="text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700 mr-3">평점:</span>
          <div className="flex space-x-1">
            <button
              onClick={() => setRatingFilter(0)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                ratingFilter === 0
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              전체
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setRatingFilter(rating)}
                className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center ${
                  ratingFilter === rating
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaStar className="mr-1 text-yellow-400" />
                {rating}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!Array.isArray(reviews) || reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {!Array.isArray(reviews)
            ? "리뷰를 불러오는 중..."
            : "아직 작성된 리뷰가 없습니다."}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <span>{review.memberEmail}</span>
                  {(review.height || review.weight) && (
                    <>
                      <br />
                      <span className="ml-2 text-sm text-gray-600 flex flex-wrap gap-2">
                        {review.height && <span>{review.height}cm</span>}
                        {review.weight && <span>{review.weight}kg</span>}
                        <span>{review.optionName}사이즈 구매</span>
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                  {currentUserEmail === review.memberEmail && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-500 hover:text-red-700 text-sm underline"
                        title="삭제"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {review.productName && (
                <div className="mb-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                  구매상품: {review.productName} <br />
                </div>
              )}

              {/* 키/몸무게 정보만 있는 경우 */}
              {!review.productName && (review.height || review.weight) && (
                <div className="mb-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
                  {review.height && `키: ${review.height}cm`}
                  {review.height && review.weight && " | "}
                  {review.weight && `몸무게: ${review.weight}kg`}
                </div>
              )}
              <div className="text-gray-800 leading-relaxed">
                {review.content}
              </div>

              {/* 리뷰 이미지 표시 */}
              {review.imageUrl && (
                <div className="mt-3">
                  <img
                    src={`http://localhost:8080${review.imageUrl}`}
                    alt="리뷰 이미지"
                    className={`rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                      expandedImage === review.imageUrl
                        ? "max-w-2xl max-h-96 object-contain"
                        : "max-w-[280px] max-h-[200px] object-cover"
                    }`}
                    onClick={() => handleImageClick(review.imageUrl)}
                    onError={(e) => {
                      console.error("리뷰 이미지 로드 실패:", e.target.src);
                      // 이미지 로드 실패 시 대체 이미지 표시
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='Arial' font-size='16'%3E이미지를 불러올 수 없습니다%3C/text%3E%3C/svg%3E";
                      e.target.onclick = null; // 클릭 이벤트 비활성화
                    }}
                    onLoad={(e) => {
                      console.log("리뷰 이미지 로드 성공:", e.target.src);
                    }}
                  />
                  {expandedImage === review.imageUrl && (
                    <div className="mt-2 text-center">
                      <button
                        onClick={() => setExpandedImage(null)}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        축소하기
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
