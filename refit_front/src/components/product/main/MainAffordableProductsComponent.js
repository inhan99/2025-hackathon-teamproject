import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { getAffordableProducts } from "../../../api/productsApi";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { MdStarRate } from "react-icons/md";
import { likeProduct, unlikeProduct } from "../../../api/likeApi";

const API_SERVER_HOST = "http://localhost:8080";

const MainAffordableProductsComponent = () => {
  const [likedMap, setLikedMap] = useState({}); // productId: true/false

  const {
    items: products,
    scrollRef,
    onScroll,
    // onVerticalScroll,
    loading,
    reset,
  } = useInfiniteScroll(
    getAffordableProducts,
    {
      maxPrice: 35000,
      minRating: 4.0,
    },
    10, // ← 10개씩 로드 (더 자주 로드)
    "affordable-products"
  );

  // window 스크롤 이벤트 리스너 추가 (중복 방지)
  useEffect(() => {
    const handleScroll = () => {
      // onVerticalScroll();
    };

    // 이벤트 리스너 등록
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // dependency 제거하여 한 번만 등록

  // 좋아요 토글 핸들러
  const handleLikeToggle = async (e, productId) => {
    e.preventDefault();
    try {
      const alreadyLiked = likedMap[productId];
      if (alreadyLiked) {
        await unlikeProduct(productId);
      } else {
        await likeProduct(productId);
      }
      setLikedMap((prev) => ({
        ...prev,
        [productId]: !alreadyLiked,
      }));
    } catch (err) {
      alert("좋아요 실패: " + err.message);
    }
  };

  return (
    <section className="py-4 bg-[#ffffff] border-l-4 border-r-4">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-green-600 px-6">
          Cost-Effectiveness Items <br />
          <p className="text-gray-600">가성비 아이템</p>
        </h2>

        <div
          ref={scrollRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6"
        >
          {products.map((product, index) => {
            const image = product.images?.[0];
            const productId = image?.productId;
            if (!productId) return null;

            const thumbnailUrl = image?.urlThumbnail
              ? `${API_SERVER_HOST}${image.urlThumbnail}`
              : `${API_SERVER_HOST}/thumbs/${productId}_thumbnail.jpg`;

            const isLiked = likedMap[productId];

            return (
              <Link
                to={`/product/${productId}`}
                key={`${productId}-${index}`}
                className="bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={thumbnailUrl}
                  alt={image?.altText || "상품 이미지"}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    if (!e.target.src.includes("/thumbs/1_thumbnail.jpg")) {
                      e.target.src = `${API_SERVER_HOST}/thumbs/1_thumbnail.jpg`;
                    }
                  }}
                />
                <div className="p-3">
                  <div>
                    <h3 className="text-gray-600 text-sm mb-1">
                      {image?.brandName || "브랜드명 없음"}
                    </h3>
                    <h3 className="font-semibold text-sm mb-1 truncate">
                      {image?.productName || "상품명 없음"}
                    </h3>
                    <p className="text-yellow-500 text-xs mb-1 flex items-center space-x-2">
                      <span className="flex items-center">
                        <MdStarRate className="mr-1" />
                        {image?.productRating?.toFixed(1) || "평점 없음"}
                      </span>
                      <span className="text-gray-600">
                        (리뷰{" "}
                        {(image?.reviewCount ?? 0) * 40 +
                          Math.floor(Math.random() * 200) +
                          1}
                        개)
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-500 text-xs line-through">
                        ₩
                        {image?.productBasePrice?.toLocaleString() ||
                          "가격 정보 없음"}
                      </p>
                      <p className="text-red-500 font-bold text-xs">
                        ₩
                        {(image?.productBasePrice * 0.8)?.toLocaleString() ||
                          "세일가 없음"}
                      </p>
                    </div>
                    <button
                      className={`transition-colors duration-200 ${
                        isLiked
                          ? "text-red-600"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                      onClick={(e) => handleLikeToggle(e, productId)}
                    >
                      <FiHeart size={16} />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
          {loading && (
            <div className="col-span-full flex items-center justify-center text-gray-500 py-8">
              로딩 중...
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MainAffordableProductsComponent;
