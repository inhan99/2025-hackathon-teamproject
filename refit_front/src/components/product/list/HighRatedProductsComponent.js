import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiHeart } from "react-icons/fi";
import { getHighRatedProducts } from "../../../api/productsApi";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { MdStarRate } from "react-icons/md";
import { likeProduct, unlikeProduct } from "../../../api/likeApi";

const API_SERVER_HOST = "http://localhost:8080";

const categories = [
  { label: "반팔", mainCategoryId: 1, subCategoryId: 1 },
  { label: "긴팔", mainCategoryId: 1, subCategoryId: 2 },
  { label: "아우터", mainCategoryId: 1, subCategoryId: 3 },
  { label: "반바지", mainCategoryId: 2, subCategoryId: 4 },
  { label: "긴바지", mainCategoryId: 2, subCategoryId: 5 },
];

const HighRatedProductsComponent = () => {
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [likedMap, setLikedMap] = useState({}); // productId: true/false

  // key를 category id 조합으로 줘서 useInfiniteScroll이 재호출되도록 처리
  const key = `${selectedMainCategoryId ?? "all"}-${
    selectedSubCategoryId ?? "all"
  }`;

  const {
    items: products,
    scrollRef,
    onScroll,
    loading,
    reset,
  } = useInfiniteScroll(
    getHighRatedProducts,
    {
      minRating: 4.5,
      mainCategoryId: selectedMainCategoryId,
      subCategoryId: selectedSubCategoryId,
    },
    10,
    key
  );

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
    reset();
  }, [selectedMainCategoryId, selectedSubCategoryId, reset, scrollRef]);

  return (
    <section className="py-4 bg-[#ffffff] border-l-4 border-r-4 ">
      <div className="max-w-[1440px] mx-auto relative">
        <h2 className="text-2xl font-bold mb-6 text-yellow-400 px-6">
          High Rated Items <br />
          <p className="text-gray-600">만족도가 높은 아이템</p>
        </h2>

        {/* 카테고리 버튼 */}
        <div className="flex gap-2 mb-6 px-6">
          <button
            onClick={() => {
              setSelectedMainCategoryId(null);
              setSelectedSubCategoryId(null);
            }}
            className={`px-4 py-2 rounded-full border font-semibold tracking-wide text-sm uppercase shadow-sm transition-all duration-200 ${
              selectedMainCategoryId === null && selectedSubCategoryId === null
                ? "bg-gray-400 text-black-600 "
                : "bg-gray-100 text-blue-300 border-gray-300 hover:bg-blue-300"
            }`}
          >
            전체
          </button>
          {categories.map(({ label, mainCategoryId, subCategoryId }) => (
            <button
              key={`${mainCategoryId}-${subCategoryId}`}
              onClick={() => {
                setSelectedMainCategoryId(mainCategoryId);
                setSelectedSubCategoryId(subCategoryId);
              }}
              className={`px-4 py-2 rounded-full border font-semibold tracking-wide text-sm uppercase shadow-sm transition-all duration-200 ${
                selectedMainCategoryId === mainCategoryId &&
                selectedSubCategoryId === subCategoryId
                  ? "bg-gray-400 text-black-600"
                  : "bg-gray-100 text-blue-300 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: -1200, behavior: "smooth" })
          }
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:shadow-lg"
        >
          <FiChevronLeft size={24} />
        </button>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="overflow-x-auto scrollbar scrollbar-thumb-green-500 scrollbar-track-gray-100"
          style={{ whiteSpace: "nowrap" }}
        >
          <div className="inline-flex">
            {products.map((product, index) => {
              const image = product.images?.[0];
              const productId = image?.productId;
              if (!productId) return null;

              const thumbnailUrl = image?.urlThumbnail
                ? `${API_SERVER_HOST}${image.urlThumbnail}`
                : `${API_SERVER_HOST}/thumbs/${productId}_thumbnail.jpg`;

              // 좋아요 상태에 따라 아이콘 색 바꿈
              const isLiked = likedMap[productId];

              return (
                <Link
                  to={`/product/${productId}`}
                  key={`${productId}-${index}`}
                  className="w-[320px] bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-300 inline-block mb-10"
                >
                  <img
                    src={thumbnailUrl}
                    alt={image?.altText || "상품 이미지"}
                    className="w-[320px] h-[360px] object-cover"
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
                          (리뷰 {(image?.reviewCount ?? 0) * 2 + 1}
                          개)
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs">
                          <p className="text-gray-500 line-through">
                            ₩
                            {image?.productBasePrice?.toLocaleString() ||
                              "가격 정보 없음"}
                          </p>
                          <span className="text-red-600 font-bold">20%</span>
                          <p className="text-red-500 font-bold">
                            ₩
                            {(
                              image?.productBasePrice * 0.8
                            )?.toLocaleString() || "세일가 없음"}
                          </p>
                        </div>
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
              <div className="w-[320px] flex items-center justify-center text-gray-500">
                로딩 중...
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: 1200, behavior: "smooth" })
          }
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:shadow-lg"
        >
          <FiChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default HighRatedProductsComponent;
