import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiHeart } from "react-icons/fi";
import { MdStarRate } from "react-icons/md";
import { getRecommendedProducts } from "../../../api/productsApi";
import { getCookie } from "../../../util/cookieUtil";

const API_SERVER_HOST = "http://localhost:8080";

const RecommendedProductsComponent = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef(null);
  const PAGE_SIZE = 10;

  // 쿠키에서 memberId 꺼내기
  const memberCookie = getCookie("member");
  const memberId =
    memberCookie?.email ||
    memberCookie?.id ||
    memberCookie?.member?.email ||
    memberCookie?.member?.id;

  const loadProducts = async (pageNum) => {
    if (loading || !hasMore || !memberId) return;
    setLoading(true);
    try {
      const data = await getRecommendedProducts(memberId, pageNum, PAGE_SIZE);
      // data는 페이지네이션 객체임
      const newProducts = data?.content || [];

      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) =>
          pageNum === 0 ? newProducts : [...prev, ...newProducts]
        );
        setPage(pageNum);
      }
    } catch (error) {
      console.error("추천 상품 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      loadProducts(0);
    } else {
      console.warn("회원 정보가 없습니다.");
    }
  }, [memberId]);

  const checkScrollPosition = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollPosition();
  }, [products]);

  const handleScroll = (e) => {
    checkScrollPosition();
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    if (scrollLeft + clientWidth >= scrollWidth - 10 && hasMore && !loading) {
      loadProducts(page + 1);
    }
  };

  if (!memberId) {
    return (
      <div className="p-4 text-center text-red-500">
        로그인 후 이용해 주세요.
      </div>
    );
  }

  return (
    <section
      className="py-4 bg-white border-l-4 border-r-4 relative"
      onMouseEnter={() => checkScrollPosition()}
      onMouseLeave={() => checkScrollPosition()}
    >
      <div className="max-w-[1440px] mx-auto relative">
        <h2 className="text-2xl font-bold mb-6 text-purple-600 px-6">
          <p className="text-gray-600">신체 사이즈 기반 추천 상품</p>
        </h2>

        {canScrollLeft && (
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: -1200, behavior: "smooth" })
            }
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:shadow-lg transition-all duration-300"
          >
            <FiChevronLeft size={24} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-x-auto scrollbar scrollbar-thumb-green-500 scrollbar-track-gray-100"
          style={{ whiteSpace: "nowrap" }}
        >
          <div className="inline-flex">
            {products.map((product, index) => {
              const image = product.images?.[0];
              const productId = image?.productId || product.id; // fallback

              if (!productId) return null;

              const thumbnailUrl = image?.urlThumbnail
                ? `${API_SERVER_HOST}${image.urlThumbnail}`
                : `${API_SERVER_HOST}/thumbs/${productId}_thumbnail.jpg`;

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
                        {product?.brandName || "브랜드명 없음"}
                      </h3>
                      <h3 className="font-semibold text-sm mb-1 truncate">
                        {product?.productName || "상품명 없음"}
                      </h3>
                      <p className="text-yellow-500 text-xs mb-1 flex items-center space-x-2">
                        <span className="flex items-center">
                          <MdStarRate className="mr-1" />
                          {product?.productRating?.toFixed(1) || "평점 없음"}
                        </span>
                        <span className="text-gray-600">
                          (리뷰 {(product?.reviewCount ?? 0) * 2 + 1}
                          개)
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs">
                          <p className="text-gray-500 line-through">
                            ₩
                            {product?.productBasePrice?.toLocaleString() ||
                              "가격 정보 없음"}
                          </p>
                          <span className="text-red-600 font-bold">20%</span>
                          <p className="text-red-500 font-bold">
                            ₩
                            {(
                              product?.productBasePrice * 0.8
                            )?.toLocaleString() || "세일가 없음"}
                          </p>
                        </div>
                      </div>
                      <button
                        className="text-red-600 hover:text-red-500 transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("찜하기 구현하세요!");
                        }}
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

        {canScrollRight && (
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: 1200, behavior: "smooth" })
            }
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:shadow-lg transition-all duration-300"
          >
            <FiChevronRight size={24} />
          </button>
        )}
      </div>
    </section>
  );
};

export default RecommendedProductsComponent;
