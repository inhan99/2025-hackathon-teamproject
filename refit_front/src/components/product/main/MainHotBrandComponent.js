import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { getProductsByBrandId } from "../../../api/productsApi";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { MdStarRate } from "react-icons/md";
import { likeProduct, unlikeProduct } from "../../../api/likeApi";

const API_SERVER_HOST = "http://localhost:8080";

// 브랜드 종류별 설정
const brands = [
  { id: 1, name: "MONVE", label: "MONVE" },
  { id: 2, name: "VOIDCRASH", label: "VOIDCRASH" },
  { id: 3, name: "softgrain", label: "softgrain" },
  { id: 4, name: "NEOSHELL", label: "NEOSHELL" },
  { id: 5, name: "Reweave", label: "Reweave" },
  { id: 6, name: "LAIN STUDIO", label: "LAIN STUDIO" },
];

const MainHotBrandComponent = () => {
  const [selectedBrandId, setSelectedBrandId] = useState(null); // 기본값 전체
  const [likedMap, setLikedMap] = useState({}); // productId: true/false

  const {
    items: products,
    scrollRef,
    onScroll,
    loading,
    reset,
  } = useInfiniteScroll(
    (params) => {
      // selectedBrandId가 null이면 모든 브랜드의 상품을 가져와서 합치기
      if (selectedBrandId === null) {
        const brandPromises = brands.map(
          (brand) => getProductsByBrandId(brand.id, params.page, 10, null, null) // ← 10개씩 로드
        );

        return Promise.all(brandPromises).then((results) => {
          const allProducts = results.flatMap((result) => {
            if (Array.isArray(result)) {
              return result;
            } else if (
              result &&
              result.content &&
              Array.isArray(result.content)
            ) {
              return result.content;
            } else {
              return [];
            }
          });
          return allProducts;
        });
      }

      // 특정 브랜드의 상품만 가져오기
      return getProductsByBrandId(
        selectedBrandId,
        params.page,
        10, // ← 10개씩 로드
        null,
        null
      ).then((result) => {
        if (Array.isArray(result)) {
          return result;
        } else if (result && result.content && Array.isArray(result.content)) {
          return result.content;
        } else {
          return [];
        }
      });
    },
    {},
    10, // ← 10개씩 로드
    `brand-${selectedBrandId ?? "all"}`
  );

  // window 스크롤 이벤트 리스너 추가 (중복 방지)
  useEffect(() => {
    const handleScroll = () => {};

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
        <h2 className="text-2xl font-bold mb-6 text-gray-900 px-6">
          브랜드별 상품 <br />
          <p className="text-[#742828]">다양한 브랜드의 상품을 확인하세요</p>
        </h2>

        {/* 브랜드 버튼 */}
        <div className="flex gap-2 mb-6 px-6">
          <button
            onClick={() => setSelectedBrandId(null)}
            className={`px-4 py-2 rounded-full border font-semibold tracking-wide text-sm uppercase shadow-sm transition-all duration-200 ${
              selectedBrandId === null
                ? "bg-gray-400 text-black-600 "
                : "bg-gray-100 text-blue-300 border-gray-300 hover:bg-blue-300"
            }`}
          >
            전체
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrandId(brand.id)}
              className={`px-4 py-2 rounded-full border font-semibold tracking-wide text-sm uppercase shadow-sm transition-all duration-200 ${
                selectedBrandId === brand.id
                  ? "bg-gray-400 text-black-600"
                  : "bg-gray-100 text-blue-300 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {brand.label}
            </button>
          ))}
        </div>

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

export default MainHotBrandComponent;
