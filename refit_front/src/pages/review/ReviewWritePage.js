import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createReview, uploadReviewImage } from "../../api/reviewApi";
import { API_SERVER_HOST } from "../../api/productsApi";
import { FaCamera, FaTimes } from "react-icons/fa";
import { getCookie, setCookie } from "../../util/cookieUtil";
import { updateCredit } from "../../slices/authSlice";

const ReviewWritePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0); // 마우스 호버용 평점
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // 적립금 계산 함수
  const calculatePoints = () => {
    let totalPoints = 1000; // 기본 적립금 1000원

    // 신체정보 입력 시 +500원
    if (height && weight && parseFloat(height) > 0 && parseFloat(weight) > 0) {
      totalPoints += 500;
    }

    // 사진 첨부 시 +1000원
    if (selectedImage || imagePreview) {
      totalPoints += 1000;
    }

    return totalPoints;
  };

  // URL 파라미터에서 상품 정보 가져오기
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const productId = searchParams.get("productId");
    const productName = searchParams.get("productName");
    const productImage = searchParams.get("productImage");
    const orderId = searchParams.get("orderId");
    const optionName = searchParams.get("optionName");

    if (productId && productName && orderId) {
      setProductInfo({
        id: productId,
        name: productName,
        image: productImage,
        orderId: orderId,
        optionName: optionName,
      });
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    if (content.trim().length < 20) {
      alert("리뷰 내용은 최소 20자 이상 입력해주세요.");
      return;
    }

    if (!productInfo) {
      alert("상품 정보가 없습니다.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // 이미지가 선택된 경우 업로드
      if (selectedImage) {
        try {
          const uploadResult = await uploadReviewImage(selectedImage);
          imageUrl = uploadResult.imageUrl;
        } catch (uploadError) {
          console.error("이미지 업로드 실패:", uploadError);
          alert("이미지 업로드에 실패했습니다. 리뷰만 등록됩니다.");
        }
      }

      const reviewData = {
        content: content.trim(),
        rating: rating,
        productId: parseInt(productInfo.id),
        orderId: parseInt(productInfo.orderId),
        optionName: productInfo.optionName || "",
        imageUrl: imageUrl,
        height: parseFloat(height),
        weight: parseFloat(weight),
      };

      console.log("보내는 리뷰 데이터:", reviewData);

      const response = await createReview(reviewData);
      const earnedPoints = response.earnedPoints || calculatePoints();

      // 쿠키의 적립금 정보 업데이트
      const memberCookie = getCookie("member");
      if (memberCookie?.member) {
        const newCredit = (memberCookie.member.credit || 0) + earnedPoints;
        const updatedMember = {
          ...memberCookie,
          member: {
            ...memberCookie.member,
            credit: newCredit,
          },
        };
        setCookie("member", updatedMember, 1);

        // Redux store 업데이트
        dispatch(updateCredit(newCredit));

        console.log("적립금 쿠키 및 Redux 업데이트 완료:", newCredit);
      }

      alert(
        `리뷰가 등록되었습니다!\n적립금 ${earnedPoints}원이 지급되었습니다.`
      );
      navigate("/order/order-list");
    } catch (error) {
      console.error("리뷰 작성 실패:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("리뷰 작성에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert("이미지 파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setSelectedImage(file);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCancel = () => {
    navigate("/order/order-list");
  };

  if (!productInfo) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="text-center text-gray-500">
          상품 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 pt-60">
      <h1 className="text-2xl font-bold mb-6">리뷰 작성</h1>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">상품 정보</h2>
        <div className="flex items-center gap-4">
          {productInfo.image && (
            <img
              src={`${API_SERVER_HOST}${productInfo.image}`}
              alt={productInfo.name}
              className="w-20 h-20 object-cover rounded"
            />
          )}
          <div>
            <p className="font-medium">{productInfo.name}</p>
            <p className="text-sm text-gray-500">상품 ID: {productInfo.id}</p>
          </div>
        </div>
      </div>

      {/* 적립금 안내 */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">
          적립금 안내
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>기본 적립금</span>
            <span className="font-semibold">+1,000원</span>
          </div>
          <div className="flex justify-between">
            <span>신체정보 입력</span>
            <span className="font-semibold text-green-600">
              {height &&
              weight &&
              parseFloat(height) > 0 &&
              parseFloat(weight) > 0
                ? "+500원"
                : "+0원"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>사진 첨부</span>
            <span className="font-semibold text-green-600">
              {selectedImage || imagePreview ? "+1,000원" : "+0원"}
            </span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-bold text-blue-800">
            <span>예상 적립금</span>
            <span>{calculatePoints().toLocaleString()}원</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 평점 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            평점 *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-2xl cursor-pointer ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                } hover:text-yellow-500 transition-colors`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600 font-semibold">
              {hoverRating || rating}점
            </span>
          </div>
        </div>

        {/* 리뷰 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            리뷰 내용 *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상품에 대한 솔직한 리뷰를 작성해주세요."
            required
            className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              content.length < 20 ? "border-red-500" : "border-gray-300"
            }`}
            rows={6}
            maxLength={1000}
          />
          <div className="text-right text-sm mt-1">
            <span
              className={content.length < 20 ? "text-red-600" : "text-gray-500"}
            >
              {content.length}/1000 (최소 20자)
            </span>
          </div>
        </div>

        {/* 신체 정보 안내 */}
        <p className="text-sm font-semibold text-red-600 mb-4">
          신체 정보 입력 (선택사항) +500P
        </p>

        {/* 키/몸무게 */}
        <div className="flex gap-6 mb-6">
          {/* 키 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              키 (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="예: 175"
              min={100}
              max={250}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 몸무게 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              몸무게 (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="예: 70"
              min={30}
              max={200}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 리뷰 이미지 업로드 */}
        <div>
          <label className="block text-sm font-semibold text-red-600 mb-4">
            리뷰 이미지 (선택사항) +1000P
          </label>
          <div className="space-y-3">
            {!imagePreview && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center text-gray-600"
                >
                  <FaCamera className="text-3xl mb-2" />
                  <p>이미지를 클릭하여 업로드</p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, GIF (최대 5MB)
                  </p>
                </label>
              </div>
            )}
            {imagePreview && (
              <div className="relative max-w-md mx-auto">
                <img
                  src={imagePreview}
                  alt="리뷰 이미지 미리보기"
                  className="w-full max-h-64 object-contain rounded-lg border"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "등록 중..." : "리뷰 등록"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewWritePage;
